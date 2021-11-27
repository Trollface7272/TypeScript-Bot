/* eslint-disable prefer-const */
import { ButtonInteraction, CommandInteraction, GuildMember, Message, MessageEmbed, MessageOptions, PermissionString } from "discord.js"
import { Bot } from "@client/Client"
import { AddButtons, Args, CalculateAcc, CommaFormat, ConvertBitMods, DateDiff, FindMapInConversation, GetCombo, GetHits, GetMapImage, GetMapLink, GetProfileImage, HandleError, ModNames, ParseArgs, RankingEmotes, RoundFixed } from "@lib/osu/Utils"
import { iOnButton, iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { GetOsuUsername } from "@database/Users"
import { AddMessageToButtons, GetButtonData } from "@bot/Interactions/Buttons/Data"
import { OsuScore } from "@lib/osu/lib/Endpoints/Score"
import { OsuProfile } from "@lib/osu/lib/Endpoints/Profile"
import { HandleAwait } from "@lib/GlobalUtils"

interface iButton extends Args {
    message: Message
}

const OsuCompare = async (author: GuildMember, { Name, Flags: { m, mods, map, offset=0 } }: Args): Promise<MessageOptions> => {
    if (!Name) return HandleError(author, { code: 1 }, Name)
    let profile: OsuProfile, scores: OsuScore, err: {code:number}
    ;[profile, err] = await HandleAwait(new OsuProfile().Load({ u: Name, m: m }))
    if (err) return HandleError(author, err, Name)
    

    ;[scores, err] = await HandleAwait(new OsuScore().Score({ u: profile.Name, b: map, m: m }))
    if (err) return HandleError(author, { code: 7 }, Name)

    if (scores.Scores.length < offset) return HandleError(author, { code: 7 }, Name)
    await scores.CalculateFcPerformance(offset, offset + 3)

    const descriptionArr = []
    for (let i = offset; i < scores.Scores.length; i++) {
        const score = scores.Scores[i]

        let fcppDisplay = ""
        if (score.Counts.miss > 0 || score.Combo < score.Beatmap.Combo - 15) fcppDisplay = `(${CommaFormat(score.FcPerformance)}pp for ${RoundFixed(score.FcAccuracy)}% FC) `
        let description = `**${i + 1}.** \`${ConvertBitMods(score.Mods)}\` **Score** [${score.Beatmap.Formatted.Difficulty.Star}★]\n`
        description += `▸ ${RankingEmotes(score.Rank)} ▸ **${score.Formatted.Performance}pp** ${fcppDisplay}▸ ${CalculateAcc(score.Counts, m)}%\n`
        description += `▸ ${score.Formatted.Score} ▸ ${GetCombo(score.Combo, score.Beatmap.Combo, m)} ▸ [${GetHits(score.Counts, m)}]\n`
        description += `▸ Score Set ${DateDiff(score.Date, new Date(new Date().toLocaleString('en-US', { timeZone: "UTC" })))}Ago\n`
        descriptionArr.push(description)
    }

    const length = descriptionArr.length + 2
    for (let i = 0; i < length; i++) {
        if (descriptionArr[i] === undefined) descriptionArr[i] = ""
    }
    const components = AddButtons({ Name, Flags: { m, mods, map, offset } }, scores.Scores.length, onButton)
    const embed = new
        MessageEmbed()
            .setAuthor(`Top ${ModNames.Name[m]} Plays for ${profile.Name} on ${scores.Scores[offset].Beatmap.Title} [${scores.Scores[offset].Beatmap.Version}]`, GetProfileImage(profile.id), GetMapLink(scores.Scores[offset].Beatmap.id))
            .setDescription(descriptionArr[0] + descriptionArr[1] + descriptionArr[2])
            .setThumbnail(GetMapImage(scores.Scores[offset].Beatmap.SetId))
            .setFooter(`On osu! Official Server | Page ${(scores.Scores.length/(offset || 1))} of ${Math.ceil(scores.Scores.length / 3)}`)
    return ({ embeds: [embed], components: components })
}

export const onMessage: iOnMessage = async (client: Bot, message: Message, args: string[]) => {
    const options = await ParseArgs(message, args)

    const resp = await OsuCompare(message.member, options)
    resp.allowedMentions = {repliedUser: false}
    const reply = await message.reply(resp)
    
    AddMessageToButtons(reply)
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    const username = interaction.options.getString("username") || await GetOsuUsername(interaction.user.id)
    if (!username) interaction.reply(HandleError(interaction.member as GuildMember, { code: 1 }, ""))

    const map = await FindMapInConversation(interaction.channel)
    if (map == "Not Found") interaction.reply(HandleError(interaction.member as GuildMember, { code: 3 }, ""))

    const options: Args = {
        Name: username as string,
        Flags: {
            m: (interaction.options.getInteger("mode") as 0 | 1 | 2 | 3) || 0,
            mods: 0,
            map: parseInt(map)
        }
    }
    await interaction.reply(await OsuCompare(interaction.member as GuildMember, options))
    const reply = await interaction.fetchReply() as Message
    
    AddMessageToButtons(reply)
}

export const onButton: iOnButton = async (interaction: ButtonInteraction) => {
    const button: iButton = GetButtonData(interaction.customId)
    
    const reply = await button.message.edit(await OsuCompare(interaction.member as GuildMember, button))
    AddMessageToButtons(reply)
    interaction.reply({}).catch(() => null)
}

export const name: string[] = ["c", "compare"]

export const interactionName = "osu compare"

export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]

