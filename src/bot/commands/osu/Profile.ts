import { CommandInteraction, GuildMember, Message, MessageActionRow, MessageEmbed, MessageOptions, MessageSelectMenu, PermissionString, SelectMenuInteraction } from "discord.js"
import { Bot } from "@client/Client"
import { iOnMessage, iOnSelectMenu, iOnSlashCommand } from "@interfaces/Command"
import { GetOsuUsername } from "@database/Users"
import { Profile } from "@interfaces/OsuApi"
import { GetProfile } from "@lib/osu/Api/Api"
import { ModNames, GetFlagUrl, GetProfileLink, GetServer, GetProfileImage, HandleError, Args, ParseArgs } from "@lib/osu/Utils"
import { getOsuSelectGamemodes } from "@lib/Constants"
import { SHA256 } from "crypto-js"
import { randomBytes } from "crypto"
import { AddDropdownData, AddMessageToDropdown, GetDropdownData } from "@bot/Interactions/Select Menu/Data"
import { RegisterSelectMenu } from "@bot/Interactions/Select Menu/info"

interface iDropdownn extends Args {
    message?: Message,
}

const osuProfile = async (author: GuildMember, { Name, Flags: { m } }: Args): Promise<MessageOptions> => {
    if (!Name) return HandleError(author, { code: 1 }, Name)

    let profile: Profile
    try { profile = await GetProfile({ u: Name, m: m }) }
    catch (err) { return HandleError(author, err, Name) }

    let description = `**▸ Official Rank:** #${profile.Rank.Global.Formatted} (${profile.Country}#${profile.Rank.Country.Formatted})\n`
    description += `**▸ Level:** ${profile.Level.Level} (${profile.Level.Progress}%)\n`
    description += `**▸ Total PP:** ${profile.Performance.Formatted}\n`
    description += `**▸ Hit Accuracy:** ${profile.Accuracy.Formatted}%\n`
    description += `**▸ Playcount:** ${profile.Playcount.Formatted}`

    const embed = new MessageEmbed()
        .setAuthor(`${ModNames.Name[m]} Profile for ${profile.Name}`, GetFlagUrl(profile.Country), GetProfileLink(profile.id, m))
        .setDescription(description)
        .setFooter(GetServer())
        .setThumbnail(GetProfileImage(profile.id))
        .setImage("https://i.imgur.com/g1pszyN.png")

    const dropdown = new MessageActionRow().addComponents(getDropdown({ Name, Flags: { m } }))

    return ({ embeds: [embed], components: [dropdown], allowedMentions: { repliedUser: false } })
}

const getDropdown = (data: iDropdownn): MessageSelectMenu => {
    const dropdown = new
        MessageSelectMenu()
        .setCustomId(SHA256(randomBytes(32).toString()).toString())
        .addOptions(getOsuSelectGamemodes(data.Flags.m))

    AddDropdownData(dropdown.customId, data)
    RegisterSelectMenu(dropdown.customId, onDropdown)

    return dropdown
}

export const onMessage: iOnMessage = async (client: Bot, message: Message, args: string[]) => {
    const options = await ParseArgs(message, args)
    const reply = await message.reply(await osuProfile(message.member, options))
    AddMessageToDropdown(reply)
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    let username = interaction.options.getString("username") || await GetOsuUsername(interaction.user.id)
    if (!username) interaction.reply(HandleError(interaction.member as GuildMember, { code: 1 }, ""))

    const options: Args = {
        Name: username as string,
        Flags: {
            m: (interaction.options.getInteger("mode") as 0 | 1 | 2 | 3) || 0
        }
    }
    interaction.reply(await osuProfile(interaction.member as GuildMember, options))

    AddMessageToDropdown(await interaction.fetchReply() as Message)
    interaction.reply({}).catch(err => null)
}

export const onDropdown: iOnSelectMenu = async (interaction: SelectMenuInteraction) => {
    const data: iDropdownn = GetDropdownData(interaction.customId)

    data.Flags.m = parseInt(interaction.values[0]) as 0 | 1 | 2 | 3

    const reply = await data.message.edit(await osuProfile(interaction.member as GuildMember, data))

    AddMessageToDropdown(reply)
    interaction.reply({}).catch(err => null)
}

export const name: string[] = ["profile", "osu", "mania", "taiko", "ctb"]

export const interactionName = "osu profile"

export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]