import { CommandInteraction, Message, MessageActionRow, MessageSelectMenu, PermissionString, SelectMenuInteraction } from "discord.js"
import { Bot } from "@client/Client"
import { iOnMessage, iOnSelectMenu, iOnSlashCommand } from "@interfaces/Command"
import { GuildMember, MessageEmbed, MessageOptions } from "discord.js"
import { Embed } from "@client/Client"
import { ParseArgs, Args, ConvertBitMods, GetDifficultyEmote, GetMapLink, HandleError, FindMapInConversation, GetModsFromString } from "@lib/osu/Utils"
import { GetBeatmap } from "@lib/osu/Api/Api"
import { Beatmap } from "@interfaces/OsuApi"
import { GetAccuracyPerformance } from "@lib/osu/Calculator"
import { SHA256 } from "crypto-js"
import { randomBytes } from "crypto"
import { getOsuSelectMods, ParseSelectedMods } from "@lib/Constants"
import { AddDropdownData, AddMessageToDropdown, GetDropdownData } from "@bot/Interactions/Select Menu/Data"
import { RegisterSelectMenu } from "@bot/Interactions/Select Menu/info"

const osuMap = async (author: GuildMember, {Name, Flags: {m, map, mods, acc}}: Args): Promise<MessageOptions> => {
    if (!map) {
        return ({embeds: [Embed({ description: "**🔴 Map not found.**" }, author.user)]})
    }

    let beatmap: Beatmap
    try { beatmap = await GetBeatmap({ a: 1, m: m, b: map, mods: mods }) }
    catch (err) { return HandleError(author, err, Name) }
    const mapDiffs = await GetAccuracyPerformance(beatmap.id, mods, m, [95, acc || 99, 100])

    let description = `**Length:** ${beatmap.Length.Total.formatted}${beatmap.Length.Drain.formatted == beatmap.Length.Total.formatted ? (" (" + beatmap.Length.Drain.formatted + "drain)") : ""} **BPM:** ${beatmap.bpm} **Mods:** ${ConvertBitMods(mods)}\n`
    description += `**Download:** [map](https://osu.ppy.sh/d/${beatmap.SetId})([no vid](https://osu.ppy.sh/d/${beatmap.SetId}n)) osu://b/${beatmap.SetId}\n`
    description += `**${GetDifficultyEmote(m, beatmap.Difficulty.Star.raw)}${beatmap.Version}**\n`
    description += `▸**Difficulty:** ${beatmap.Difficulty.Star.Formatted}★ ▸**Max Combo:** x${beatmap.MaxCombo}\n`
    description += `▸**AR:** ${beatmap.Difficulty.Approach.Formatted} ▸**OD:** ${beatmap.Difficulty.Overall.Formatted} ▸**HP:** ${beatmap.Difficulty.HealthDrain.Formatted} ▸**CS:** ${beatmap.Difficulty.CircleSize.Formatted}\n`
    description += `▸**PP:** `
    description += `○ **${mapDiffs[0].AccuracyPercent.Formatted}%-**${mapDiffs[0].Total.Formatted}`
    description += `○ **${mapDiffs[1].AccuracyPercent.Formatted}%-**${mapDiffs[1].Total.Formatted}`
    description += `○ **${mapDiffs[2].AccuracyPercent.Formatted}%-**${mapDiffs[2].Total.Formatted}`

    const dropdown = new MessageActionRow().addComponents(GetDropdown({Name, Flags: {m, map, mods, acc}}))

    const embed = new MessageEmbed()
        .setAuthor(`${beatmap.Artist} - ${beatmap.Title} by ${beatmap.Mapper}`, ``, GetMapLink(beatmap.id))
        .setThumbnail(GetMapLink(beatmap.SetId))
        .setDescription(description)
        .setFooter(`${beatmap.Approved} | ${beatmap.FavouritedCount} ❤︎ ${beatmap.ApprovedRaw > 0 ? ("| Approved " + new Date(beatmap.ApprovedDate).toISOString().slice(0,10).replaceAll("-", " ")) : ""}`)
        .setImage("https://i.imgur.com/g1pszyN.png")
        
    return ({ embeds: [embed], components: [dropdown], allowedMentions: {repliedUser: false} })
}

const GetDropdown = (options: Args) => {
    const dropdown = new
        MessageSelectMenu()
            .setCustomId(SHA256(randomBytes(32).toString()).toString())
            .setMinValues(0)
            .setMaxValues(6)
            .addOptions(getOsuSelectMods(options.Flags.mods))
    AddDropdownData(dropdown.customId, options)
    RegisterSelectMenu(dropdown.customId, onDropdown)
    return dropdown
}

export const onMessage: iOnMessage = async (client: Bot, message: Message, args: string[]) => {
    const options: Args = await ParseArgs(message, args)
    
    const reply = await message.reply(await osuMap(message.member, options))
    AddMessageToDropdown(reply)
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    const map = interaction.options.getNumber("map_id") || parseInt(interaction.options.getString("map_link").split("/").pop()) || parseInt(await FindMapInConversation(interaction.channel))
    if (!map || isNaN(map)) interaction.reply(HandleError(interaction.member as GuildMember, { code: 3 }, ""))
    
    const options: Args = {
        Name: "",
        Flags: {
            map: map,
            m: interaction.options.getInteger("mode") as 0 | 1 | 2 | 3,
            mods: GetModsFromString(interaction.options.getString("mods")) || interaction.options.getInteger("raw_mods") || 0,
            acc: interaction.options.getNumber("accuracy")
        }
    }

    interaction.reply(await osuMap(interaction.member as GuildMember, options))

    AddMessageToDropdown(await interaction.fetchReply() as Message)
}

export const onDropdown: iOnSelectMenu = async (interaction: SelectMenuInteraction) => {
    const id = interaction.customId
    const data = GetDropdownData(id)
    data.Flags.mods = ParseSelectedMods(interaction)
    const reply = await data.message.edit(await osuMap(interaction.member as GuildMember, data))
    
    AddMessageToDropdown(reply)
    
    interaction.reply({}).catch(() => null)
}

export const name = ["map", "m"]

export const interactionName = "osu map"

export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]

