import { ApplicationCommandData, CommandInteraction, GuildMember, Message, MessageEmbed, PermissionString } from "discord.js"
import { Bot, Embed } from "@client/Client"
import { Beatmap, Profile, Score } from "@interfaces/OsuApi"
import { GetBeatmap, GetProfileCache, GetTop } from "@lib/osu/Api/Api"
import { Args, CalculateAcc, ConvertBitMods, DateDiff, GetCombo, GetFlagUrl, GetHits, GetMapLink, GetProfileImage, GetProfileLink, GetServer, HandleError, ModNames, ParseArgs, RankingEmotes, RoundFixed } from "@lib/osu/Utils"
import { GetFcAccuracy, GetFcPerformance } from "@lib/osu/Calculator"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { osuGamemodeOption, osuUsernameOption } from "@lib/Constants"
import { GetOsuUsername } from "@database/Users"

const osuTopPlays = async (author: GuildMember, options: Args) => {
    if (!options.Name) return HandleError(author, {code: 1}, options.Name)

    if ((options.Flags.g) && !(options.Flags.b || options.Flags.rv)) return GreaterCount(author, options)
    return Normal(author, options)
    
}

const Normal = async (author: GuildMember, {Name, Flags: {m, rv, g, b, p, rand}}: Args) => {
    let profile: Profile
    try { profile = await GetProfileCache({ u: Name, m: m }) }
    catch (err) { HandleError(author, err, Name) }

    let scores: Array<Score>
    try { scores = await GetTop({ u: Name, m: m, limit: 100 }) }
    catch (err) { HandleError(author, err, profile.Name) }

    if (g) scores = scores.filter(e => rv ? (e.Performance.raw < g) : (e.Performance.raw > g))

    if (b) scores.sort((a, b) => b.Date.getTime() - a.Date.getTime())

    if (rv) {
        scores = scores.reverse()
    }

    if (p) {
        const out: Array<Score> = []
        for (let i = 0; i < p.length; i++) {
            out.push(scores[p[i]])
        }
        scores = out
    }

    if (rand) scores = [scores[Math.floor(Math.random() * (scores.length - 1) + 1)]]


    let desc = ""
    for (let i = 0; i < Math.min(scores.length, 5); i++) {
        desc += await FormatTopPlay(author, m, scores[i])
    }
    const embed = new MessageEmbed()
        .setAuthor(`Top ${Math.min(scores.length, 5)} ${ModNames.Name[m]} Plays for ${profile.Name}`, GetFlagUrl(profile.Country), GetProfileLink(profile.id, m))
        .setDescription(desc)
        .setFooter(GetServer())
        .setThumbnail(GetProfileImage(profile.id))
    return ({ embeds: [embed] })
}

const FormatTopPlay = async (author: GuildMember, m: 0|1|2|3, score: Score): Promise<string> => {
    let beatmap: Beatmap
    try { beatmap = await GetBeatmap({ b: score.MapId, m: m, mods: score.Mods }) }
    catch (err) { HandleError(author, err, score.Username); return "" }

    let fcppDisplay = "", description = ""
    if (score.Combo < beatmap.MaxCombo - 15 || score.Counts.miss > 0) fcppDisplay = `(${await (await GetFcPerformance(score, m)).Total.Formatted}pp for ${GetFcAccuracy(score.Counts, m)}% FC) `
    description += `**${score.Index}. [${beatmap.Title} [${beatmap.Version}]](${GetMapLink(beatmap.id)}) +${ConvertBitMods(score.Mods)}** [${beatmap.Difficulty.Star.Formatted}★]\n`
    description += `▸ ${RankingEmotes(score.Rank)} ▸ **${score.Performance.Formatted}pp** ${fcppDisplay}▸ ${CalculateAcc(score.Counts, m)}%\n`
    description += `▸ ${score.Score.Formatted} ▸ ${GetCombo(score.Combo, beatmap.MaxCombo, m)} ▸ [${GetHits(score.Counts, m)}]\n`
    description += `▸ Score Set ${DateDiff(score.Date, new Date(new Date().toLocaleString('en-US', { timeZone: "UTC" })))}Ago\n`

    return description
}

const GreaterCount = async (author: GuildMember, options: Args) => {
    let profile: Profile
    try { profile = await GetProfileCache({ u: options.Name, m: options.Flags.m }) }
    catch (err) { HandleError(author, err, options.Name) }

    let scores: Array<Score>
    try { scores = await GetTop({ u: options.Name, m: options.Flags.m, limit: 100 }) }
    catch (err) { HandleError(author, err, profile.Name) }

    scores = scores.filter(e => 
        options.Flags.rv ? (e.Performance.raw < options.Flags.g) : (e.Performance.raw > options.Flags.g)
    )

    return ({embeds: [Embed({ description: `**${profile.Name} has ${scores.length} plays worth more than ${RoundFixed(parseFloat(options.Flags.g + ""))}pp**` }, author.user)]})
}


export const onMessage: iOnMessage = async (client: Bot, message: Message, args: Array<string>) => {
    const options: Args = await ParseArgs(message, args)

    message.reply(await osuTopPlays(message.member, options))
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    let username = interaction.options.getString("username") || await GetOsuUsername(interaction.user.id)
    if (!username) interaction.reply(HandleError(interaction.member as GuildMember, { code: 1 }, ""))
    let specific = [interaction.options.getNumber("specific")]
    const options: Args = {
        Name: username as string,
        Flags: {
            m: interaction.options.getNumber("mode") as 0 | 1 | 2 | 3,
            b: interaction.options.getBoolean("best"),
            g: interaction.options.getNumber("greater than"),
            rv: interaction.options.getBoolean("reversed"),
            rand: interaction.options.getBoolean("random"),
            p: specific.length > 0 ? specific : false
        }
    }

    interaction.reply(await osuTopPlays(interaction.member as GuildMember, options))
}


export const name: string[] = ["top", "osutop", "maniatop", "taikotop", "ctbtop"]

export const commandData: ApplicationCommandData = {
    name: "osu top",
    description: "get top 5 plays.",
    options: [osuUsernameOption, osuGamemodeOption, {
        name: "best",
        description: "Newest top plays.",
        type: "BOOLEAN",
        required: false
    }, {
        name: "greater than",
        description: "Top plays above selected number.",
        type: "NUMBER",
        required: false
    }, {
        name: "reversed",
        description: "Reverse selection.",
        type: "BOOLEAN",
        required: false
    }, {
        name: "specific",
        description: "Which top play (1-100).",
        type: "NUMBER",
        required: false
    }, {
        name: "random",
        description: "Random top play",
        type: "BOOLEAN",
        required: false
    }],
    type: "CHAT_INPUT",
    defaultPermission: true
}

export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]