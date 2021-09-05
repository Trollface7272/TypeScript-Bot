import { Message, MessageEmbed } from "discord.js"
import { Bot } from "../../client/Client"
import { RunFunction } from "../../../shared/interfaces/Command"
import { Args, ConvertBitMods, GetDifficultyEmote, GetMapLink, HandleError, ParseArgs, RoundFixed } from "../../osu/Utils"
import { GetBeatmap } from "../../osu/Api/Api"
import { Beatmap } from "../../../shared/interfaces/OsuApi"
import { GetAccuracyPerformance } from "../../osu/Calculator"


export const run: RunFunction = async (client: Bot, message: Message, args: string[]) => {
    const options: Args = await ParseArgs(client, message, args)
    if (!options.Flags.map) {
        message.channel.send({embeds: [client.embed({ description: "**🔴 Map not found.**" }, message)]})
        return
    }

    let beatmap: Beatmap
    try { beatmap = await GetBeatmap({ a: 1, m: options.Flags.m, b: options.Flags.map, mods: options.Flags.mods }) }
    catch (err) { return HandleError(client, message, err, options.Name) }
    let mapDiffs = await GetAccuracyPerformance(client, message, beatmap.id, options.Flags.mods, options.Flags.m, [95, options.Flags.acc || 99, 100])

    let description = `**Length:** ${beatmap.Length.Total.formatted}${beatmap.Length.Drain.formatted == beatmap.Length.Total.formatted ? (" (" + beatmap.Length.Drain.formatted + "drain)") : ""} **BPM:** ${beatmap.bpm} **Mods:** ${ConvertBitMods(client, options.Flags.mods)}\n`
    description += `**Download:** [map](https://osu.ppy.sh/d/${beatmap.SetId})([no vid](https://osu.ppy.sh/d/${beatmap.SetId}n)) osu://b/${beatmap.SetId}\n`
    description += `**${GetDifficultyEmote(client, message, options.Flags.m, beatmap.Difficulty.Star.raw)}${beatmap.Version}**\n`
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

    message.channel.send({ embeds: [embed] })
}

export const name: string = "map"