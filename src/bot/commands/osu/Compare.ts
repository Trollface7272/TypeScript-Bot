import { ButtonInteraction, CommandInteraction, GuildMember, Interaction, Message, MessageActionRow, MessageButton, MessageEmbed, MessageOptions, PermissionString } from "discord.js"
import { Bot } from "@client/Client"
import { Args, CalculateAcc, ConvertBitMods, DateDiff, FindMapInConversation, GetCombo, GetHits, GetMapImage, GetMapLink, GetProfileImage, HandleError, ModNames, ParseArgs, RankingEmotes } from "@lib/osu/Utils"
import { iOnButton, iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { GetBeatmap, GetProfile, GetScore } from "@lib/osu/Api/Api"
import { Beatmap, Difficulty, Profile, Score } from "@interfaces/OsuApi"
import { GetDiffWithMods, GetFcAccuracy, GetFcPerformance } from "@lib/osu/Calculator"
import { GetOsuUsername } from "@database/Users"
import { SHA256 } from "crypto-js"
import { randomBytes } from "crypto"
import { RegisterButton } from "@bot/Interactions/Buttons"

const Buttons = {

}

interface iButton {
    offset: number,
    beatmapId: number,
    profile: number,
    m: number,
    message: Message
}

const OsuCompare = async (author: GuildMember, { Name, Flags: { m, mods, map } }: Args, offset: number = 0): Promise<MessageOptions> => {
    if (!Name) return HandleError(author, { code: 1 }, Name)

    let profile: Profile
    try { profile = await GetProfile({ u: Name, m: m }) }
    catch (err) { return HandleError(author, err, Name) }

    let scores: Array<Score>
    try { scores = await GetScore({ u: profile.Name, b: map, m: m }) }
    catch (err) { return HandleError(author, err, Name) }
    if (scores.length < offset) return HandleError(author, { code: 7 }, Name)

    let beatmap: Beatmap
    try { beatmap = await GetBeatmap({ b: map, m: m, mods: mods }) }
    catch (err) { return HandleError(author, err, Name) }

    let beatmapDiffs: Difficulty[] = []
    const modCombinatios: number[] = []
    scores.forEach(e => modCombinatios.push(e.Mods))
    beatmapDiffs = await GetDiffWithMods(beatmap.id, m, modCombinatios)

    const descriptionArr = []
    for (let i = offset; i < scores.length; i++) {
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
    const components = AddButtons(offset, profile.id, beatmap.id, m, scores.length)
    
    return ({
        embeds: [new
            MessageEmbed()
            .setAuthor(`Top ${ModNames.Name[m]} Plays for ${profile.Name} on ${beatmap.Title} [${beatmap.Version}]`, GetProfileImage(profile.id), GetMapLink(beatmap.id))
            .setDescription(descriptionArr[0] + descriptionArr[1] + descriptionArr[2])
            .setThumbnail(GetMapImage(beatmap.SetId))
            .setFooter(`On osu! Official Server | Page 1 of ${Math.ceil(scores.length / 3)}`)],
        components
    })
}

const AddButtons = (offset: number, userId: number, beatmapId: number, m: number, scoreCount: number) => {
    const buttons = []
    
    if (offset !== 0) buttons.push(AddButton("⬅️", offset-3, userId, beatmapId, m))
    if (offset + 3 < scoreCount) buttons.push(AddButton("➡️", offset+3, userId, beatmapId, m))
    const components = [new MessageActionRow().addComponents(buttons)]

    return components
}

const AddButton = (emoji: string, offset: number, userId: number, beatmapId: number, m: number) => {
    const button = new MessageButton()
        .setCustomId(SHA256(randomBytes(32).toString()).toString())
        .setEmoji(emoji)
        .setStyle("PRIMARY")

    Buttons[button.customId] = {
        offset: offset,
        beatmapId: beatmapId,
        profile: userId,
        m: m
    }
    RegisterButton(button.customId, onButton)
    return button
}

const AddMessageToButtons = (message: Message) => {
    const [b1, b2] = message.components[0].components
    
    if (b1) Buttons[b1.customId].message = message
    if (b2) Buttons[b2.customId].message = message
}

export const onMessage: iOnMessage = async (client: Bot, message: Message, args: string[]) => {
    const options = await ParseArgs(message, args)

    const resp = await OsuCompare(message.member, options)
    resp.allowedMentions = {repliedUser: false}
    const reply = await message.reply(resp)
    
    AddMessageToButtons(reply)
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    let username = interaction.options.getString("username") || await GetOsuUsername(interaction.user.id)
    if (!username) interaction.reply(HandleError(interaction.member as GuildMember, { code: 1 }, ""))

    let map = await FindMapInConversation(interaction.channel)
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
    const {profile, m, beatmapId, offset, message}: iButton = Buttons[interaction.customId]
    
    const reply = await message.edit(await OsuCompare(interaction.member as GuildMember, {Name: profile as unknown as string, Flags: {m:m as 0|1|2|3, map: beatmapId}}, offset))
    AddMessageToButtons(reply)
    interaction.reply({}).catch(err => null)
}

export const name: string[] = ["c", "compare"]

export const interactionName = "osu compare"

export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]

