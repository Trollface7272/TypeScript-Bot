import { CommandInteraction, Message, MessageActionRow, MessageSelectMenu, PermissionString, SelectMenuInteraction } from "discord.js"
import { Bot } from "@client/Client"
import { iOnMessage, iOnSelectMenu, iOnSlashCommand } from "@interfaces/Command"
import { GuildMember, MessageEmbed, MessageOptions } from "discord.js"
import { Embed } from "@client/Client"
import { ParseArgs, Args, ConvertBitMods, GetDifficultyEmote, GetMapLink, HandleError, FindMapInConversation, GetModsFromString } from "@lib/osu/Utils"
import { SHA256 } from "crypto-js"
import { randomBytes } from "crypto"
import { getOsuSelectMods, ParseSelectedMods } from "@lib/Constants"
import { AddDropdownData, AddMessageToDropdown, GetDropdownData } from "@bot/Interactions/Select Menu/Data"
import { RegisterSelectMenu } from "@bot/Interactions/Select Menu/info"
import { OsuBeatmap } from "@lib/osu/lib/Endpoints/Beatmap"
import { MapCalculator } from "@lib/osu/lib/Calculator"
import { onMessage as osuCompare } from "./Compare"

export const osuMap = async (author: GuildMember, { Name, Flags: { m, map, mods, acc, b } }: Args): Promise<MessageOptions> => {
    if (!map) {
        return ({ embeds: [Embed({ description: "**🔴 Map not found.**" }, author.user)] })
    }

    const beatmap = await new OsuBeatmap().Load({ a: 1, m: m, b: map, mods: mods }).catch(e => HandleError(author, e, Name))
    if (!(beatmap instanceof OsuBeatmap)) return beatmap

    const accs = [95, acc || 99, 100]
    const mapDiffs = accs.map(el => {
        return new MapCalculator(beatmap, mods, el)
    })
     
    let description = `**Length:** ${beatmap.Formatted.Length.Total}${beatmap.Formatted.Length.Drain !== beatmap.Formatted.Length.Total ? (` (${beatmap.Formatted.Length.Drain} drain)`) : ""} **BPM:** ${beatmap.Bpm} **Mods:** ${ConvertBitMods(mods)}\n`
    description += `**Download:** [map](https://osu.ppy.sh/d/${beatmap.SetId})([no vid](https://osu.ppy.sh/d/${beatmap.SetId}n)) osu://b/${beatmap.SetId}\n`
    description += `**${GetDifficultyEmote(m, beatmap.Difficulty.Star)}${beatmap.Version}**\n`
    description += `▸**Difficulty:** ${beatmap.Formatted.Difficulty.Star}★ ▸**Max Combo:** x${beatmap.Combo}\n`
    description += `▸**AR:** ${beatmap.Formatted.Difficulty.Approach} ▸**OD:** ${beatmap.Formatted.Difficulty.Overall} ▸**HP:** ${beatmap.Formatted.Difficulty.HealthDrain} ▸**CS:** ${beatmap.Formatted.Difficulty.CircleSize}\n`
    description += `▸**PP:** `
    description += `○ **${mapDiffs[0].Formatted.AccPerc}%-**${mapDiffs[0].Formatted.Total}`
    description += `○ **${mapDiffs[1].Formatted.AccPerc}%-**${mapDiffs[1].Formatted.Total}`
    description += `○ **${mapDiffs[2].Formatted.AccPerc}%-**${mapDiffs[2].Formatted.Total}`

    const dropdown = new MessageActionRow().addComponents(GetDropdown({ Name, Flags: { m, map, mods, acc } }))

    const embed = new MessageEmbed()
        .setAuthor(`${beatmap.Artist} - ${beatmap.Title} by ${beatmap.Mapper}`, ``, GetMapLink(beatmap.id))
        .setThumbnail(GetMapLink(beatmap.SetId))
        .setDescription(description)
        .setFooter(`${beatmap.Approved} | ${beatmap.FavouritedCount} ❤︎ ${beatmap.ApprovedRaw > 0 ? ("| Approved " + new Date(beatmap.ApprovedDate).toISOString().slice(0, 10).replaceAll("-", " ")) : ""}`)
        .setImage("https://i.imgur.com/g1pszyN.png")

    return ({ embeds: [embed], components: [dropdown], allowedMentions: { repliedUser: false } })
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

    if (options.Flags.c) 
        return await osuCompare(client, message, args)
    

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

