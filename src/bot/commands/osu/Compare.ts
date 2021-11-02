import { Message, MessageEmbed } from "discord.js"
import { Bot } from "../../client/Client"
import { RunFunction } from "../../../shared/interfaces/Command"
import { Beatmap, Difficulty, Profile, Score } from "../../../shared/interfaces/OsuApi"
import { GetBeatmap, GetProfile, GetScore } from "../../../lib/osu/Api/Api"
import { CalculateAcc, ConvertBitMods, DateDiff, GetCombo, GetHits, GetMapImage, GetMapLink, GetProfileImage, HandleError, ModNames, ParseArgs, RankingEmotes } from "../../../lib/osu/Utils"
import { GetDiffWithMods, GetFcAccuracy, GetFcPerformance } from "../../../lib/osu/Calculator"


export const run: RunFunction = async (client: Bot, message: Message, args: string[]) => {
    const options = await ParseArgs(client, message, args)

    if (!options.Name) return HandleError(client, message, {code: 1}, options.Name)
    
    let profile: Profile
    try { profile = await GetProfile({ u: options.Name, m: options.Flags.m }) }
    catch (err) { return HandleError(client, message, err, options.Name) }

    let scores: Array<Score>
    try { scores = await GetScore({ u: profile.Name, b: options.Flags.map, m: options.Flags.m }) }
    catch (err) { return HandleError(client, message, err, options.Name) }

    let beatmap: Beatmap
    try { beatmap = await GetBeatmap({ b: options.Flags.map, m: options.Flags.m, mods: options.Flags.mods }) }
    catch (err) { return HandleError(client, message, err, options.Name) }
    let beatmapDiffs: Difficulty[] = []
    const modCombinatios: number[] = []
    scores.forEach(e => modCombinatios.push(e.Mods))
    beatmapDiffs = await GetDiffWithMods(client, message, beatmap.id, options.Flags.m, modCombinatios)

    const descriptionArr = []
    for (let i = 0; i < scores.length; i++) {
        const score = scores[i]
        const diff = beatmapDiffs[i]

        let fcppDisplay = ""
        if (score.Counts.miss > 0 || score.Combo < beatmap.MaxCombo - 15) fcppDisplay = `(${(await GetFcPerformance(client, message, score, options.Flags.m)).Total.Formatted}pp for ${GetFcAccuracy(client, message, score.Counts, options.Flags.m)}% FC) `
        let description = `**${i + 1}.** \`${ConvertBitMods(client, score.Mods)}\` **Score** [${diff.Total.Formatted}★]\n`
        description += `▸ ${RankingEmotes(client, score.Rank)} ▸ **${score.Performance.Formatted}pp** ${fcppDisplay}▸ ${CalculateAcc(client, score.Counts, options.Flags.m)}%\n`
        description += `▸ ${score.Score.Formatted} ▸ ${GetCombo(client, score.Combo, beatmap.MaxCombo, options.Flags.m)} ▸ [${GetHits(client, score.Counts, options.Flags.m)}]\n`
        description += `▸ Score Set ${DateDiff(client, score.Date, new Date(new Date().toLocaleString('en-US', { timeZone: "UTC" })))}Ago\n`
        descriptionArr.push(description)
    }
    const length = descriptionArr.length + 2
    for (let i = 0; i < length; i++) {
        if (descriptionArr[i] === undefined) descriptionArr[i] = ""
    }
    message.channel.send({
        embeds: [new
            MessageEmbed()
            .setAuthor(`Top ${ModNames.Name[options.Flags.m]} Plays for ${profile.Name} on ${beatmap.Title} [${beatmap.Version}]`, GetProfileImage(profile.id), GetMapLink(beatmap.id))
            .setDescription(descriptionArr[0] + descriptionArr[1] + descriptionArr[2])
            .setThumbnail(GetMapImage(beatmap.SetId))
            .setFooter("On osu! Official Server | Page 1 of 1")]
    })
}

export const name: string[] = ["c", "compare"]