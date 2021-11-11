import { ApplicationCommandData, CommandInteraction, Message, PermissionString } from "discord.js"
import { Bot } from "@client/Client"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { GuildMember, MessageEmbed, MessageOptions } from "discord.js"
import { Embed } from "@client/Client"
import { ParseArgs, Args, ConvertBitMods, GetDifficultyEmote, GetMapLink, HandleError, FindMapInConversation, GetModsFromString } from "@lib/osu/Utils"
import { GetBeatmap } from "@lib/osu/Api/Api"
import { Beatmap } from "@interfaces/OsuApi"
import { GetAccuracyPerformance } from "@lib/osu/Calculator"
import { osuGamemodeOption } from "@lib/Constants"

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

    const embed = new MessageEmbed()
        .setAuthor(`${beatmap.Artist} - ${beatmap.Title} by ${beatmap.Mapper}`, ``, GetMapLink(beatmap.id))
        .setThumbnail(GetMapLink(beatmap.SetId))
        .setDescription(description)
        .setFooter(`${beatmap.Approved} | ${beatmap.FavouritedCount} ❤︎ ${beatmap.ApprovedRaw > 0 ? ("| Approved" + beatmap.ApprovedDate.toDateString()) : ""}`)

    return ({ embeds: [embed] })
}

export const onMessage: iOnMessage = async (client: Bot, message: Message, args: string[]) => {
    const options: Args = await ParseArgs(message, args)
    
    message.reply(await osuMap(message.member, options))
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    let map = interaction.options.getNumber("map id") || parseInt(interaction.options.getString("map link").split("/").pop()) || parseInt(await FindMapInConversation(interaction.channel))
    if (!map || isNaN(map)) interaction.reply(HandleError(interaction.member as GuildMember, { code: 3 }, ""))
    const options: Args = {
        Name: "",
        Flags: {
            map: map,
            m: interaction.options.getNumber("mode") as 0 | 1 | 2 | 3,
            mods: GetModsFromString(interaction.options.getString("mods")) || interaction.options.getNumber("mods number") || 0,
            acc: interaction.options.getNumber("accuracy")
        }
    }

    interaction.reply(await osuMap(interaction.member as GuildMember, options))
}

export const name = "map"
export const commandData: ApplicationCommandData = {
    name: "osu map",
    description: "Show info about map.",
    options: [{
        name: "map id",
        description: "Id of the map.",
        type: "NUMBER",
        required: false,
    }, {
        name: "map link",
        description: "Link to the map.",
        type: "STRING",
        required: false,
    }, {
        name: "mods",
        description: "Mods in 2 letter per mod format.",
        type: "STRING",
        required: false        
    }, {
        name: "mods number",
        description: "Mods as number.",
        type: "NUMBER",
        required: false        
    }, {
        name: "accuracy",
        description: "Accuracy to show",
        type: "NUMBER",
        required: false
    }, osuGamemodeOption],
    type: "CHAT_INPUT",
    defaultPermission: true
}
export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]

