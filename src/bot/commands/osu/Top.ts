import { ButtonInteraction, CommandInteraction, GuildMember, Message, MessageEmbed, MessageOptions, PermissionString } from "discord.js"
import { Bot, Embed } from "@client/Client"
import { Beatmap, Profile, Score } from "@interfaces/OsuApi"
import { GetBeatmap, GetProfileCache, GetTop } from "@lib/osu/Api/Api"
import { AddButtons, Args, CalculateAcc, ConvertBitMods, DateDiff, GetCombo, GetFlagUrl, GetHits, GetMapLink, GetProfileImage, GetProfileLink, GetServer, HandleError, ModNames, ParseArgs, RankingEmotes, RoundFixed } from "@lib/osu/Utils"
import { GetFcAccuracy, GetFcPerformance } from "@lib/osu/Calculator"
import { iOnButton, iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { GetOsuUsername } from "@database/Users"
import { AddMessageToButtons, GetButtonData } from "@bot/Interactions/Buttons/Data"


interface iButton extends Args {
    message?: Message,
}


export const osuTopPlays = async (author: GuildMember, options: Args) => {
    if (!options.Name) return HandleError(author, { code: 1 }, options.Name)

    if ((options.Flags.g) && !(options.Flags.b || options.Flags.rv)) return GreaterCount(author, options)
    return Normal(author, options)

}

const Normal = async (author: GuildMember, { Name, Flags: { m, rv, g, b, p, rand, offset = 0, cache=false } }: Args) => {
    let profile: Profile
    try { profile = await GetProfileCache({ u: Name, m: m }) }
    catch (err) { HandleError(author, err, Name) }

    let scores: Array<Score>
    try { scores = await GetTop({ u: Name, m: m, limit: 100, useCache: cache }) }
    catch (err) { HandleError(author, err, profile.Name) }
    
    if (g) scores = scores.filter(e => rv ? (e.Performance.raw < g) : (e.Performance.raw > g))

    if (b) scores.sort((a, b) => b.Date.getTime() - a.Date.getTime())

    if (rv) {
        scores = scores.reverse()
    }

    if (p) {
        p.sort((a,b) => a-b)
        const out: Array<Score> = []
        for (let i = 0; i < p.length; i++) {
            if (scores[p[i]]) out.push(scores[p[i]])
        }
        scores = out
        if (out.length < 1) return HandleError(author, {code: 8, count: p[0]+1}, Name)
    }

    if (rand) scores = [scores[Math.floor(Math.random() * (scores.length - 1) + 1)]]
    
    let desc = ""
    for (let i = offset; i < Math.min(offset + scores.length, offset + 5); i++) {
        desc += await FormatTopPlay(author, m, scores[i])
    }

    const components = AddButtons({ Name, Flags: { m, rv, g, b, p, rand, offset } }, scores.length, onButton)

    const embed = new MessageEmbed()
        .setAuthor(`Top ${Math.min(scores.length, 5)} ${ModNames.Name[m]} Plays for ${profile.Name}`, GetFlagUrl(profile.Country), GetProfileLink(profile.id, m))
        .setDescription(desc)
        .setFooter(GetServer())
        .setThumbnail(GetProfileImage(profile.id))
    return ({ embeds: [embed],
        components: (components[0].components.length !== 0 ? components : undefined) 
    })
}



const FormatTopPlay = async (author: GuildMember, m: 0 | 1 | 2 | 3, score: Score): Promise<string> => {
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
    interaction.reply({}).catch(err => null)
}

export const name: string[] = ["top", "osutop", "maniatop", "taikotop", "ctbtop"]

export const interactionName = "osu top"

export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]