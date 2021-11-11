import { ApplicationCommandData, CommandInteraction, GuildMember, Message, MessageEmbed, MessageOptions, PermissionString } from "discord.js"
import { Bot } from "@client/Client"
import { Args, CalculateAcc, ConvertBitMods, DateDiff, FindMapInConversation, GetCombo, GetHits, GetMapImage, GetMapLink, GetProfileImage, HandleError, ModNames, ParseArgs, RankingEmotes } from "@lib/osu/Utils"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { GetBeatmap, GetProfile, GetScore } from "@lib/osu/Api/Api"
import { Beatmap, Difficulty, Profile, Score } from "@interfaces/OsuApi"
import { GetDiffWithMods, GetFcAccuracy, GetFcPerformance } from "@lib/osu/Calculator"
import { osuGamemodeOption, osuUsernameOption } from "@lib/Constants"
import { GetOsuUsername } from "@database/Users"

const OsuCompare = async (author: GuildMember, {Name, Flags: {m, mods, map}}: Args): Promise<MessageOptions> => {
    if (!Name) return HandleError(author, {code: 1}, Name)

    let profile: Profile
    try { profile = await GetProfile({ u: Name, m: m }) }
    catch (err) { return HandleError(author, err, Name) }

    let scores: Array<Score>
    try { scores = await GetScore({ u: profile.Name, b: map, m: m }) }
    catch (err) { return HandleError(author, err, Name) }

    let beatmap: Beatmap
    try { beatmap = await GetBeatmap({ b: map, m: m, mods: mods }) }
    catch (err) { return HandleError(author, err, Name) }

    let beatmapDiffs: Difficulty[] = []
    const modCombinatios: number[] = []
    scores.forEach(e => modCombinatios.push(e.Mods))
    beatmapDiffs = await GetDiffWithMods(beatmap.id, m, modCombinatios)

    const descriptionArr = []
    for (let i = 0; i < scores.length; i++) {
        const score = scores[i]
        const diff = beatmapDiffs[i]

        let fcppDisplay = ""
        if (score.Counts.miss > 0 || score.Combo < beatmap.MaxCombo - 15) fcppDisplay = `(${(await GetFcPerformance(score, m)).Total.Formatted}pp for ${GetFcAccuracy(score.Counts, m)}% FC) `
        let description = `**${i + 1}.** \`${ConvertBitMods(score.Mods)}\` **Score** [${diff.Total.Formatted}★]\n`
        description += `▸ ${RankingEmotes(score.Rank)} ▸ **${score.Performance.Formatted}pp** ${fcppDisplay}▸ ${CalculateAcc(score.Counts, m)}%\n`
        description += `▸ ${score.Score.Formatted} ▸ ${GetCombo(score.Combo, beatmap.MaxCombo, m)} ▸ [${GetHits(score.Counts, m)}]\n`
        description += `▸ Score Set ${DateDiff(score.Date, new Date(new Date().toLocaleString('en-US', { timeZone: "UTC" })))}Ago\n`
        descriptionArr.push(description)
    }

    const length = descriptionArr.length + 2
    for (let i = 0; i < length; i++) {
        if (descriptionArr[i] === undefined) descriptionArr[i] = ""
    }
    return ({
        embeds: [new
            MessageEmbed()
            .setAuthor(`Top ${ModNames.Name[m]} Plays for ${profile.Name} on ${beatmap.Title} [${beatmap.Version}]`, GetProfileImage(profile.id), GetMapLink(beatmap.id))
            .setDescription(descriptionArr[0] + descriptionArr[1] + descriptionArr[2])
            .setThumbnail(GetMapImage(beatmap.SetId))
            .setFooter("On osu! Official Server | Page 1 of 1")]
    })
}


export const onMessage: iOnMessage = async (client: Bot, message: Message, args: string[]) => {
    const options = await ParseArgs(message, args)

    message.reply(await OsuCompare(message.member, options))
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    let username = interaction.options.getString("username") || await GetOsuUsername(interaction.user.id)
    if (!username) interaction.reply(HandleError(interaction.member as GuildMember, { code: 1 }, ""))
    let map = await FindMapInConversation(interaction.channel)
    if (map == "Not Found") interaction.reply(HandleError(interaction.member as GuildMember, { code: 3 }, ""))
    const options: Args = {
        Name: username as string,
        Flags: {
            m: (interaction.options.getNumber("mode") as 0 | 1 | 2 | 3) || 0,
            mods: 0,
            map: parseInt(map)
        }
    }

    interaction.reply(await OsuCompare(interaction.member as GuildMember, options))
}

export const name: string[] = ["c", "compare"]
export const commandData: ApplicationCommandData = {
    name: "osu compare",
    description: "Show score on the last map in conversation.",
    options: [osuUsernameOption, osuGamemodeOption],
    type: "CHAT_INPUT",
    defaultPermission: true
}
export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]

