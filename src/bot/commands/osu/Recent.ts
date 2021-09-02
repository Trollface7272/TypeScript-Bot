import { Message, MessageEmbed } from "discord.js"
import { Bot } from "../../client/Client"
import { RunFunction } from "../../../shared/interfaces/Command"
import { GetBeatmap, GetProfileCache, GetRecent, GetTop } from "../../osu/Api/Api"
import { ParseArgs, ModNames, GetFlagUrl, GetProfileLink, GetServer, GetProfileImage, HandleError, RankingEmotes, CalculateAcc, GetHits, CalculateProgress, ConvertBitMods, GetMapLink, GetMapImage, DateDiff, ErrorIds, Args, GetCombo } from "../../osu/Utils"
import { GetFcAcc, GetFcPP, GetPP } from "../../osu/Calculator"
import { Beatmap, Profile, Score } from "../../../shared/interfaces/OsuApi"

export const run: RunFunction = async (client: Bot, message: Message, args: string[]) => {
    const options: Args = await ParseArgs(client, message, args)
    if (!options.Name) return HandleError(client, message, { code: ErrorIds.NoUsername }, "")

    if (options.Flags.b) return RecentBest(client, message, options)


    let profile: Profile
    try { profile = await GetProfileCache({ u: options.Name, m: options.Flags.m }) }
    catch (err) { return HandleError(client, message, err, options.Name) }

    let recent: Array<Score>
    try { recent = await GetRecent({ u: options.Name, m: options.Flags.m, limit: 50 }) }
    catch (err) { return HandleError(client, message, err, profile.Name) }

    if (recent.length == 0) return HandleError(client, message, {code: 5}, profile.Name)

    const score: Score = recent[0]


    let beatmap: Beatmap
    try { beatmap = await GetBeatmap({ b: score.MapId, m: options.Flags.m, mods: score.Mods }) }
    catch (err) {
        console.log(err);
        return HandleError(client, message, err, profile.Name)
    }


    let tries = 0
    for (let i = 0; i < recent.length; i++) {
        if (recent[i].MapId === score.MapId) tries++
        else break
    }

    let fcppDisplay = ""
    if (score.Combo < beatmap.MaxCombo - 15 || score.Counts.miss > 0)
        fcppDisplay = `(${GetFcPP(client, score, beatmap, options.Flags.m)}pp for ${GetFcAcc(client, score, options.Flags.m)}% FC) `

    let desc = `▸ ${RankingEmotes(client, score.Rank)} ▸ **${GetPP(client, score, beatmap, options.Flags.m)}pp** ${fcppDisplay}▸ ${CalculateAcc(client, score.Counts, options.Flags.m)}%\n`
    desc += `▸ ${score.Score.Formatted} ▸ x${score.Combo}/${beatmap.MaxCombo} ▸ [${GetHits(client, score.Counts, options.Flags.m)}]`

    if (score.Rank == "F")
        desc += `\n▸ **Map Completion:** ${CalculateProgress(client, score.Counts, beatmap.Objects, options.Flags.m)}%`


    const embed = new MessageEmbed()
        .setAuthor(`${beatmap.Title} [${beatmap.Version}] +${ConvertBitMods(client, score.Mods)} [${beatmap.Difficulty.Star.Formatted}★]`, GetProfileImage(profile.id), GetMapLink(beatmap.id))
        .setThumbnail(GetMapImage(beatmap.SetId))
        .setDescription(desc)
        .setFooter(`Try #${tries} | ${DateDiff(client, score.Date, new Date(new Date().toLocaleString('en-US', { timeZone: "UTC" })))}Ago ${GetServer()}`)
    message.channel.send({ embeds: [embed] })
}


const RecentBest = async (client: Bot, message: Message, options: Args) => {
    let profile: Profile
    try { profile = await GetProfileCache({ u: options.Name, m: options.Flags.m }) }
    catch (err) { return HandleError(client, message, err, options.Name) }

    let scores: Array<Score>
    try { scores = await GetTop({ u: options.Name, m: options.Flags.m, limit: 100 }) }
    catch (err) { return HandleError(client, message, err, profile.Name) }

    if (options.Flags.g) scores = scores.filter(val => val.Performance.raw > options.Flags.g)

    scores.sort((a, b) => options.Flags.rv ? a.Date.getTime() - b.Date.getTime() : b.Date.getTime() - a.Date.getTime())

    const score: Score = scores[0]

    let beatmap: Beatmap
    try { beatmap = await GetBeatmap({ b: score.MapId, m: options.Flags.m, mods: score.Mods }) }
    catch (err) { return HandleError(client, message, err, profile.Name) }

    let fcppDisplay = ""
    if (score.Combo < beatmap.MaxCombo - 15 || score.Counts.miss > 0) fcppDisplay = `(${GetFcPP(client, score, beatmap, options.Flags.m)}pp for ${GetFcAcc(client, score, options.Flags.m)}% FC) `

    let desc = `**${score.Index}. [${beatmap.Title} [${beatmap.Version}]](${GetMapLink(beatmap.id)}) +${ConvertBitMods(client, score.Mods)}** [${beatmap.Difficulty.Star.Formatted}★]\n`
    desc += `▸ ${RankingEmotes(client, score.Rank)} ▸ **${score.Performance.Formatted}pp** ${fcppDisplay}▸ ${CalculateAcc(client, score.Counts, options.Flags.m)}%\n`
    desc += `▸ ${score.Score.Formatted} ▸ ${GetCombo(client, score.Combo, beatmap.MaxCombo, options.Flags.m)} ▸ [${GetHits(client, score.Counts, options.Flags.m)}]\n`
    desc += `▸ Score Set ${DateDiff(client, score.Date, new Date(new Date().toLocaleString('en-US', { timeZone: "UTC" })))}Ago`

    let embed: MessageEmbed = new MessageEmbed()
        .setAuthor(`Top ${score.Index} ${ModNames.Name[options.Flags.m]} Play for ${profile.Name}`, GetFlagUrl(profile.Country), GetProfileLink(profile.id, options.Flags.m))
        .setDescription(desc)
        .setFooter(GetServer())
        .setThumbnail(GetProfileImage(profile.id))
    message.channel.send({ embeds: [embed] })
}

export const name: Array<string> = ["r", "rs", "recent"]