/* eslint-disable prefer-const */
import { ButtonInteraction, CommandInteraction, GuildMember, Message, MessageEmbed, MessageOptions, PermissionString } from "discord.js"
import { Bot, Embed } from "@client/Client"
import { AddButtons, Args, CalculateAcc, CommaFormat, ConvertBitMods, DateDiff, GetCombo, GetFlagUrl, GetHits, GetMapLink, GetProfileImage, GetProfileLink, GetServer, HandleError, ModNames, ParseArgs, RankingEmotes, RoundFixed } from "@lib/osu/Utils"
import { iOnButton, iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { GetOsuUsername } from "@database/Users"
import { AddMessageToButtons, GetButtonData } from "@bot/Interactions/Buttons/Data"
import { OsuScore, Score } from "@lib/osu/lib/Endpoints/Score"
import { OsuProfile } from "@lib/osu/lib/Endpoints/Profile"
import { HandleAwait } from "@lib/GlobalUtils"


interface iButton extends Args {
    message?: Message,
}


export const osuTopPlays = async (author: GuildMember, options: Args) => {
    if (!options.Name) return HandleError(author, { code: 1 }, options.Name)

    if ((options.Flags.g) && !(options.Flags.b || options.Flags.rv)) return GreaterCount(author, options)
    return Normal(author, options)

}

const Normal = async (author: GuildMember, { Name, Flags: { m, rv, g, b, p, rand, offset = 0, cache = false } }: Args) => {
    let profile: OsuProfile, top: OsuScore, err: { code: number }
    ;[profile, err] = await HandleAwait(new OsuProfile().Load({ u: Name, m: m }))
    if (err) return HandleError(author, err, Name)
    
    ;[top, err] = await HandleAwait(new OsuScore().Top({ u: Name, m: m, limit: 100, useCache: cache }))
    if (err) return HandleError(author, err, profile.Name)
    let scores = top.Scores
    if (g) scores = scores.filter(e => rv ? (e.Performance < g) : (e.Performance > g))

    if (b) scores.sort((a, b) => b.Date.getTime() - a.Date.getTime())

    if (rv) {
        scores = scores.reverse()
    }

    if (p) {
        p.sort((a, b) => a - b)
        const out: Score[] = []
        for (let i = 0; i < p.length; i++) {
            if (scores[p[i]]) out.push(scores[p[i]])
        }
        scores = out
        if (out.length < 1) return HandleError(author, { code: 8, count: p[0] + 1 }, Name)
    }

    if (rand) scores = [scores[Math.floor(Math.random() * (scores.length - 1) + 1)]]

    for (let i = offset; i < Math.min(offset+5, scores.length); i++) await scores[i].CalculateFcPerformance()

    let desc = ""
    for (let i = offset; i < Math.min(offset + scores.length, offset + 5); i++) {
        desc += await FormatTopPlay(author, m, scores[i])
    }

    const components = AddButtons({ Name, Flags: { m, rv, g, b, p, rand, offset } }, scores.length, onButton)

    const embed = new MessageEmbed()
        .setAuthor(`Top ${Math.min(scores.length, 5)} ${ModNames.Name[m]} Play${scores.length > 1 ? "s" : ""} for ${profile.Name}`, GetFlagUrl(profile.Country), GetProfileLink(profile.id, m))
        .setDescription(desc)
        .setFooter(GetServer())
        .setThumbnail(GetProfileImage(profile.id))
    return ({ embeds: [embed], components: components })
}



const FormatTopPlay = async (author: GuildMember, m: 0 | 1 | 2 | 3, score: Score): Promise<string> => {
    const beatmap = score.Beatmap

    let fcppDisplay = "", description = ""
    if (score.Combo < beatmap.Combo - 15 || score.Counts.miss > 0) fcppDisplay = `(${CommaFormat(score.FcPerformance)}pp for ${RoundFixed(score.FcAccuracy)}% FC) `
    description += `**${score.Index}. [${beatmap.Title} [${beatmap.Version}]](${GetMapLink(beatmap.id)}) +${ConvertBitMods(score.Mods)}** [${beatmap.Formatted.Difficulty.Star}★]\n`
    description += `▸ ${RankingEmotes(score.Rank)} ▸ **${score.Formatted.Performance}pp** ${fcppDisplay}▸ ${CalculateAcc(score.Counts, m)}%\n`
    description += `▸ ${score.Formatted.Score} ▸ ${GetCombo(score.Combo, beatmap.Combo, m)} ▸ [${GetHits(score.Counts, m)}]\n`
    description += `▸ Score Set ${DateDiff(score.Date, new Date(new Date().toLocaleString('en-US', { timeZone: "UTC" })))}Ago\n`

    return description
}

const GreaterCount = async (author: GuildMember, options: Args) => {
    let profile: OsuProfile, top: OsuScore, err: { code: number }
    ;[profile, err] = await HandleAwait(new OsuProfile().Load({ u: options.Name, m: options.Flags.m }))
    if (err) return HandleError(author, err, options.Name)

    ;[top, err] = await HandleAwait(new OsuScore().Top({ u: options.Name, m: options.Flags.m, limit: 100 }))
    if (err) return HandleError(author, err, profile.Name)

    let scores = top.Scores

    scores = scores.filter(e =>
        options.Flags.rv ? (e.Performance < options.Flags.g) : (e.Performance > options.Flags.g)
    )

    return ({ embeds: [Embed({ description: `**${profile.Name} has ${scores.length} plays worth more than ${RoundFixed(parseFloat(options.Flags.g + ""))}pp**` }, author.user)] })
}


export const onMessage: iOnMessage = async (client: Bot, message: Message, args: string[]) => {
    const options: Args = await ParseArgs(message, args)

    const resp = await osuTopPlays(message.member, options) as MessageOptions
    resp.allowedMentions = { repliedUser: false }
    const reply = await message.reply(resp)

    AddMessageToButtons(reply)
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    const username = interaction.options.getString("username") || await GetOsuUsername(interaction.user.id)
    if (!username) interaction.reply(HandleError(interaction.member as GuildMember, { code: 1 }, ""))

    const specific = interaction.options.getInteger("specific")

    const options: Args = {
        Name: username as string,
        Flags: {
            m: (interaction.options.getInteger("mode") as 0 | 1 | 2 | 3) || 0,
            b: interaction.options.getBoolean("best"),
            g: interaction.options.getNumber("greater_than"),
            rv: interaction.options.getBoolean("reversed"),
            rand: interaction.options.getBoolean("random"),
            p: specific ? [specific] : false
        }
    }

    interaction.reply(await osuTopPlays(interaction.member as GuildMember, options))

    AddMessageToButtons(await interaction.fetchReply() as Message)
}

export const onButton: iOnButton = async (interaction: ButtonInteraction) => {
    const button: iButton = GetButtonData(interaction.customId)
    button.Flags.cache = true

    const reply = await button.message.edit(await osuTopPlays(interaction.member as GuildMember, button))

    AddMessageToButtons(reply)
    interaction.reply({}).catch(() => null)
}

export const name: string[] = ["top", "osutop", "maniatop", "taikotop", "ctbtop"]

export const interactionName = "osu top"

export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]