import { Message, MessageEmbed } from "discord.js"
import { Bot } from "../../client/Client"
import { RunFunction } from "../../../interfaces/Command"
import { Beatmap, Profile, Score } from "../../../interfaces/OsuApi"
import { GetBeatmap, GetProfileCache, GetTop } from "../../../lib/osu/Api/Api"
import { Args, CalculateAcc, ConvertBitMods, DateDiff, GetCombo, GetFlagUrl, GetHits, GetMapLink, GetProfileImage, GetProfileLink, GetServer, HandleError, ModNames, ParseArgs, RankingEmotes, RoundFixed } from "../../../lib/osu/Utils"
import { GetFcAccuracy, GetFcPerformance } from "../../../lib/osu/Calculator"

const FormatTopPlay = async (client: Bot, message: Message, score: Score, options: Args): Promise<string> => {
    let beatmap: Beatmap
    try { beatmap = await GetBeatmap({ b: score.MapId, m: options.Flags.m, mods: score.Mods }) }
    catch (err) { HandleError(client, message, err, score.Username); return "" }

    let fcppDisplay = "", description = ""
    if (score.Combo < beatmap.MaxCombo - 15 || score.Counts.miss > 0) fcppDisplay = `(${await (await GetFcPerformance(client, message, score, options.Flags.m)).Total.Formatted}pp for ${GetFcAccuracy(client, message, score.Counts, options.Flags.m)}% FC) `
    description += `**${score.Index}. [${beatmap.Title} [${beatmap.Version}]](${GetMapLink(beatmap.id)}) +${ConvertBitMods(client, score.Mods)}** [${beatmap.Difficulty.Star.Formatted}★]\n`
    description += `▸ ${RankingEmotes(client, score.Rank)} ▸ **${score.Performance.Formatted}pp** ${fcppDisplay}▸ ${CalculateAcc(client, score.Counts, options.Flags.m)}%\n`
    description += `▸ ${score.Score.Formatted} ▸ ${GetCombo(client, score.Combo, beatmap.MaxCombo, options.Flags.m)} ▸ [${GetHits(client, score.Counts, options.Flags.m)}]\n`
    description += `▸ Score Set ${DateDiff(client, score.Date, new Date(new Date().toLocaleString('en-US', { timeZone: "UTC" })))}Ago\n`

    return description
}

export const run: RunFunction = async (client: Bot, message: Message, args: Array<string>) => {
    const options: Args = await ParseArgs(client, message, args)

    if (!options.Name) return HandleError(client, message, {code: 1}, options.Name)

    if ((options.Flags.g) && !(options.Flags.b || options.Flags.rv)) return GreaterCount(client, message, options)

    let profile: Profile
    try { profile = await GetProfileCache({ u: options.Name, m: options.Flags.m }) }
    catch (err) { HandleError(client, message, err, options.Name) }

    let scores: Array<Score>
    try { scores = await GetTop({ u: options.Name, m: options.Flags.m, limit: 100 }) }
    catch (err) { HandleError(client, message, err, profile.Name) }

    if (options.Flags.g) scores = scores.filter(e => options.Flags.rv ? (e.Performance.raw < options.Flags.g) : (e.Performance.raw > options.Flags.g))

    if (options.Flags.b) scores.sort((a, b) => b.Date.getTime() - a.Date.getTime())

    if (options.Flags.rv) {
        scores = scores.reverse()
    }

    if (options.Flags.p) {
        const out: Array<Score> = []
        for (let i = 0; i < options.Flags.p.length; i++) {
            out.push(scores[options.Flags.p[i]])
        }
        scores = out
    }

    if (options.Flags.rand) scores = [scores[Math.floor(Math.random() * (scores.length - 1) + 1)]]


    let desc = ""
    for (let i = 0; i < Math.min(scores.length, 5); i++) {
        desc += await FormatTopPlay(client, message, scores[i], options)
    }
    const embed = new MessageEmbed()
        .setAuthor(`Top ${Math.min(scores.length, 5)} ${ModNames.Name[options.Flags.m]} Plays for ${profile.Name}`, GetFlagUrl(profile.Country), GetProfileLink(profile.id, options.Flags.m))
        .setDescription(desc)
        .setFooter(GetServer())
        .setThumbnail(GetProfileImage(profile.id))
    message.channel.send({ embeds: [embed] })
}

const GreaterCount = async (client: Bot, message: Message, options: Args) => {
    let profile: Profile
    try { profile = await GetProfileCache({ u: options.Name, m: options.Flags.m }) }
    catch (err) { HandleError(client, message, err, options.Name) }

    let scores: Array<Score>
    try { scores = await GetTop({ u: options.Name, m: options.Flags.m, limit: 100 }) }
    catch (err) { HandleError(client, message, err, profile.Name) }

    scores = scores.filter(e => 
        options.Flags.rv ? (e.Performance.raw < options.Flags.g) : (e.Performance.raw > options.Flags.g)
    )

    message.channel.send({embeds: [client.embed({ description: `**${profile.Name} has ${scores.length} plays worth more than ${RoundFixed(parseFloat(options.Flags.g + ""))}pp**` }, message)]})
}

export const name: Array<string> = ["top", "osutop", "maniatop", "taikotop", "ctbtop"]