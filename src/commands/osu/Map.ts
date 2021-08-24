import { Message, MessageEmbed } from "discord.js"
import { Bot } from "../../client/Client"
import { RunFunction } from "../../interfaces/Command"
import { Args, ConvertBitMods, GetDifficultyEmote, GetMapLink, HandleError, ParseArgs, RoundFixed } from "../../osu/Utils"
import { GetBeatmap } from "../../osu/Api/Api"
import { GetMapPP } from "../../osu/Calculator"
import { Beatmap } from "../../interfaces/OsuApi"


export const run: RunFunction = async (client: Bot, message: Message, args: string[]) => {
    const options: Args = await ParseArgs(client, message, args)
    if (!options.Flags.map) {
        message.channel.send({embeds: [client.embed({ description: "**🔴 Map not found.**" }, message)]})
        return
    }

    let beatmap: Beatmap
    try { beatmap = await GetBeatmap({ a: 1, m: options.Flags.m, b: options.Flags.map, mods: options.Flags.mods }) }
    catch (err) { return HandleError(client, message, err, options.Name) }

    let description = `**Length:** ${beatmap.Length.Total.formatted}:${beatmap.Length.Drain.formatted} **BPM:** ${beatmap.bpm} **Mods:** ${ConvertBitMods(client, options.Flags.mods)}\n`
    description += `**Download:** [map](https://osu.ppy.sh/d/${beatmap.SetId})([no vid](https://osu.ppy.sh/d/${beatmap.SetId}n)) osu://b/${beatmap.SetId}\n`
    description += `**${GetDifficultyEmote(client, message, options.Flags.m, beatmap.Difficulty.Star.raw)}${beatmap.Version}**\n`
    description += `▸**Difficulty:** ${beatmap.Difficulty.Star.Formatted}★ ▸**Max Combo:** x${beatmap.MaxCombo}\n`
    description += `▸**AR:** ${beatmap.Difficulty.Approach.Formatted} ▸**OD:** ${beatmap.Difficulty.Overall.Formatted} ▸**HP:** ${beatmap.Difficulty.HealthDrain.Formatted} ▸**CS:** ${beatmap.Difficulty.CircleSize.Formatted}\n`
    description += `▸**PP:** `
    description += `○ **95%-**${GetMapPP(client, beatmap, options.Flags.m, 95)}`
    if (options.Flags.acc)
        description += `○ **${RoundFixed(options.Flags.acc)}%-**${GetMapPP(client, beatmap, options.Flags.m, options.Flags.acc)}`
    else
        description += `○ **99%-**${GetMapPP(client, beatmap, options.Flags.m, 99)}`
    description += `○ **100%-**${GetMapPP(client, beatmap, options.Flags.m, 100)}`

    const embed = new MessageEmbed()
        .setAuthor(`${beatmap.Artist} - ${beatmap.Title} by ${beatmap.Mapper}`, ``, GetMapLink(beatmap.id))
        .setThumbnail(GetMapLink(beatmap.SetId))
        .setDescription(description)
        .setFooter(`${beatmap.Approved} | ${beatmap.FavouritedCount} ❤︎ | Approved ${beatmap.ApprovedDate}`)

    message.channel.send({ embeds: [embed] })
}

export const name: string = "map"