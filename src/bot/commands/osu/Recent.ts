import { ButtonInteraction, CommandInteraction, Message, PermissionString } from "discord.js"
import { Bot } from "@client/Client"
import { GuildMember, MessageEmbed, MessageOptions } from "discord.js"
import { GetBeatmap, GetProfileCache, GetRecent, GetTop } from "@lib/osu/Api/Api"
import { ModNames, GetFlagUrl, GetProfileLink, GetServer, GetProfileImage, HandleError, RankingEmotes, CalculateAcc, GetHits, CalculateProgress, ConvertBitMods, GetMapLink, GetMapImage, DateDiff, ErrorIds, Args, GetCombo, ParseArgs, AddButtons } from "@lib/osu/Utils"
import { Beatmap, Profile, Score } from "@interfaces/OsuApi"
import { GetFcAccuracy, GetFcPerformance, GetPlayPerformance } from "@lib/osu/Calculator"
import { iOnButton, iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { GetOsuUsername } from "@database/Users"
import { AddMessageToButtons, GetButtonData } from "@bot/Interactions/Buttons/Data"

interface iButtonData extends Args {
    message: Message
}

const osuRecent = async (author: GuildMember, options: Args): Promise<MessageOptions> => {
    if (!options.Name) return HandleError(author, { code: ErrorIds.NoUsername }, "")
    if (options.Flags.l) return RecentList(author, options)

    if (options.Flags.b) return RecentBest(author, options)

    return Normal(author, options)
}

const Normal = async (author: GuildMember, { Name, Flags: { m, offset = 0 } }: Args): Promise<MessageOptions> => {
    const realOffset = offset / 5
    let profile: Profile
    try { profile = await GetProfileCache({ u: Name, m: m }) }
    catch (err) { return HandleError(author, err, Name) }

    let recent: Score[]
    try { recent = await GetRecent({ u: Name, m: m, limit: 50 }) }
    catch (err) { return HandleError(author, err, profile.Name) }

    if (recent.length == 0) return HandleError(author, { code: 5 }, profile.Name)

    const score: Score = recent[realOffset]


    let beatmap: Beatmap
    try { beatmap = await GetBeatmap({ b: score.MapId, m: m, mods: score.Mods }) }
    catch (err) { return HandleError(author, err, profile.Name) }


    let tries = 0
    for (let i = realOffset; i < recent.length; i++) {
        if (recent[i].MapId === score.MapId) tries++
        else break
    }

    let fcppDisplay = ""
    if (score.Combo < beatmap.MaxCombo - 15 || score.Counts.miss > 0)
        fcppDisplay = `(${(await GetFcPerformance(score, m)).Total.Formatted}pp for ${GetFcAccuracy(score.Counts, m)}% FC) `

    let desc = `▸ ${RankingEmotes(score.Rank)} ▸ **${(await GetPlayPerformance(score, m)).Total.Formatted}pp** ${fcppDisplay}▸ ${CalculateAcc(score.Counts, m)}%\n`
    desc += `▸ ${score.Score.Formatted} ▸ x${score.Combo}/${beatmap.MaxCombo} ▸ [${GetHits(score.Counts, m)}]`

    if (score.Rank == "F")
        desc += `\n▸ **Map Completion:** ${CalculateProgress(score.Counts, beatmap.Objects, m)}%`


    const embed = new MessageEmbed()
        .setAuthor(`${beatmap.Title} [${beatmap.Version}] +${ConvertBitMods(score.Mods)} [${beatmap.Difficulty.Star.Formatted}★]`, GetProfileImage(profile.id), GetMapLink(beatmap.id))
        .setThumbnail(GetMapImage(beatmap.SetId))
        .setDescription(desc)
        .setFooter(`Try #${tries} | ${DateDiff(score.Date, new Date(new Date().toLocaleString('en-US', { timeZone: "UTC" })))}Ago ${GetServer()}`)
    const button = AddButtons({ Name, Flags: { m, offset } }, recent.length * 5, onButton)

    return ({ embeds: [embed], components: button, allowedMentions: { repliedUser: false } })
}

const RecentBest = async (author: GuildMember, { Name, Flags: { m, g, rv, offset = 0, b, l } }: Args): Promise<MessageOptions> => {
    const realOffset = offset / 5
    let profile: Profile
    try { profile = await GetProfileCache({ u: Name, m: m }) }
    catch (err) { return HandleError(author, err, Name) }

    let scores: Score[]
    try { scores = await GetTop({ u: Name, m: m, limit: 100 }) }
    catch (err) { return HandleError(author, err, profile.Name) }

    if (g) scores = scores.filter(val => val.Performance.raw > g)

    scores.sort((a, b) => rv ? a.Date.getTime() - b.Date.getTime() : b.Date.getTime() - a.Date.getTime())

    const score: Score = scores[realOffset]

    let beatmap: Beatmap
    try { beatmap = await GetBeatmap({ b: score.MapId, m: m, mods: score.Mods }) }
    catch (err) { return HandleError(author, err, profile.Name) }

    let fcppDisplay = ""
    if (score.Combo < beatmap.MaxCombo - 15 || score.Counts.miss > 0) fcppDisplay = `(${(await GetFcPerformance(score, m)).Total.Formatted}pp for ${GetFcAccuracy(score.Counts, m)}% FC) `

    let desc = `**${score.Index}. [${beatmap.Title} [${beatmap.Version}]](${GetMapLink(beatmap.id)}) +${ConvertBitMods(score.Mods)}** [${beatmap.Difficulty.Star.Formatted}★]\n`
    desc += `▸ ${RankingEmotes(score.Rank)} ▸ **${score.Performance.Formatted}pp** ${fcppDisplay}▸ ${CalculateAcc(score.Counts, m)}%\n`
    desc += `▸ ${score.Score.Formatted} ▸ ${GetCombo(score.Combo, beatmap.MaxCombo, m)} ▸ [${GetHits(score.Counts, m)}]\n`
    desc += `▸ Score Set ${DateDiff(score.Date, new Date(new Date().toLocaleString('en-US', { timeZone: "UTC" })))}Ago`

    const embed: MessageEmbed = new MessageEmbed()
        .setAuthor(`Top ${score.Index} ${ModNames.Name[m]} Play for ${profile.Name}`, GetFlagUrl(profile.Country), GetProfileLink(profile.id, m))
        .setDescription(desc)
        .setFooter(GetServer())
        .setThumbnail(GetProfileImage(profile.id))

    const button = AddButtons({ Name, Flags: { m, g, rv, offset, b, l } }, scores.length * 5, onButton)

    return ({ embeds: [embed], components: button, allowedMentions: { repliedUser: false } })
}

const RecentList = async (author: GuildMember, { Name, Flags: { m, offset = 0, l, b } }: Args): Promise<MessageOptions> => {
    let profile: Profile
    try { profile = await GetProfileCache({ u: Name, m: m }) }
    catch (err) { return HandleError(author, err, Name) }

    let recent: Array<Score>
    try { recent = await GetRecent({ u: Name, m: m, limit: offset + 6 }) }
    catch (err) { return HandleError(author, err, profile.Name) }

    if (recent.length == 0) return HandleError(author, { code: 5 }, profile.Name)



    const beatmaps: Beatmap[] = []
    let description = ""
    for (let i = offset; i < Math.min(recent.length, offset + 5); i++) {
        const score = recent[offset];
        let beatmap: Beatmap
        if (beatmaps[score.MapId]) beatmap = beatmaps[score.MapId]
        else try {
            beatmap = await GetBeatmap({ b: score.MapId, m: m, mods: score.Mods })
            beatmaps[score.MapId] = beatmap
        } catch (err) { return HandleError(author, err, profile.Name) }

        let fcppDisplay = ""
        if (score.Counts.miss > 0 || score.Combo < beatmap.MaxCombo - 15)
            fcppDisplay = `(${(await GetFcPerformance(score, m)).Total.Formatted}pp for ${GetFcAccuracy(score.Counts, m)}% FC) `

        if (score.Combo < beatmap.MaxCombo - 15 || score.Counts.miss > 0) fcppDisplay = `(${(await GetFcPerformance(score, m)).Total.Formatted}pp for ${GetFcAccuracy(score.Counts, m)}% FC) `
        description += `**${score.Index}. [${beatmap.Title} [${beatmap.Version}]](${GetMapLink(beatmap.id)}) +${ConvertBitMods(score.Mods)}** [${beatmap.Difficulty.Star.Formatted}★]\n`
        description += `▸ ${RankingEmotes(score.Rank)} ▸ **${(await GetPlayPerformance(score, m)).Total.Formatted}pp** ${fcppDisplay}▸ ${CalculateAcc(score.Counts, m)}%\n`
        description += `▸ ${score.Score.Formatted} ▸ ${GetCombo(score.Combo, beatmap.MaxCombo, m)} ▸ [${GetHits(score.Counts, m)}]\n`
        description += `▸ Score Set ${DateDiff(score.Date, new Date(new Date().toLocaleString('en-US', { timeZone: "UTC" })))}Ago\n`

        if (score.Rank == "F")
            description += `▸ **Map Completion:** ${CalculateProgress(score.Counts, beatmap.Objects, m)}%\n`
    }
    const embed = new MessageEmbed()
        .setAuthor(`Recent 5 plays for ${profile.Name}`, GetFlagUrl(profile.Country), GetProfileLink(profile.id, m))
        .setThumbnail(GetProfileImage(profile.id))
        .setDescription(description)
        .setFooter(`${GetServer()}`)
    const button = AddButtons({ Name, Flags: { m, offset, l, b } }, recent.length * 5, onButton)

    return ({ embeds: [embed], components: button, allowedMentions: { repliedUser: false } })
}

export const onMessage: iOnMessage = async (client: Bot, message: Message, args: string[]) => {
    const options: Args = await ParseArgs(message, args)

    const reply = await message.reply(await osuRecent(message.member, options))

    AddMessageToButtons(reply)
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    const username = interaction.options.getString("username") || await GetOsuUsername(interaction.user.id)
    if (!username) interaction.reply(HandleError(interaction.member as GuildMember, { code: 1 }, ""))

    const options: Args = {
        Name: username as string,
        Flags: {
            m: (interaction.options.getInteger("mode") as 0 | 1 | 2 | 3) || 0,
            l: interaction.options.getBoolean("list"),
            b: interaction.options.getBoolean("best"),
            g: interaction.options.getNumber("greater_than"),
            rv: interaction.options.getBoolean("reversed"),
        }
    }

    interaction.reply(await osuRecent(interaction.member as GuildMember, options))
    AddMessageToButtons(await interaction.fetchReply() as Message)
}

export const onButton: iOnButton = async (interaction: ButtonInteraction) => {
    const options = GetButtonData(interaction.customId) as iButtonData

    const reply = await options.message.edit(await osuRecent(interaction.member as GuildMember, options))
    
    AddMessageToButtons(reply)

    interaction.reply({}).catch(() => null)
}


export const name: string[] = ["r", "rs", "recent"]

export const interactionName = "osu recent"

export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]

