import { CommandInteraction, GuildMember, Message, MessageActionRow, MessageEmbed, MessageOptions, MessageSelectMenu, PermissionString, SelectMenuInteraction } from "discord.js"
import { Bot } from "@client/Client"
import { iOnMessage, iOnSelectMenu, iOnSlashCommand } from "@interfaces/Command"
import { GetOsuUsername } from "@database/Users"
import { ModNames, GetFlagUrl, GetProfileLink, GetServer, GetProfileImage, HandleError, Args, ParseArgs } from "@lib/osu/Utils"
import { getOsuSelectGamemodes } from "@lib/Constants"
import { AddDropdownData, AddMessageToDropdown, GetDropdownData } from "@bot/Interactions/Select Menu/Data"
import { RegisterSelectMenu } from "@bot/Interactions/Select Menu/info"
import { GenCustomId } from "@lib/GlobalUtils"
import { OsuProfile } from "@lib/osu/new/Profile"

interface iDropdownn extends Args {
    message?: Message,
}

const osuProfile = async (author: GuildMember, { Name, Flags: { m } }: Args): Promise<MessageOptions> => {
    if (!Name) return HandleError(author, { code: 1 }, Name)

    let profile: OsuProfile|MessageOptions = await new OsuProfile().Load({ u: Name, m }).catch(e => HandleError(author, e, Name))
    
    if (!(profile instanceof OsuProfile)) return profile
    profile = profile as OsuProfile

    let description = `**▸ Official Rank:** #${profile.Formatted.Rank.Global} (${profile.Country}#${profile.Formatted.Rank.Country})\n`
    description += `**▸ Level:** ${profile.Formatted.Level}\n`
    description += `**▸ Total PP:** ${profile.Formatted.Performence}\n`
    description += `**▸ Hit Accuracy:** ${profile.Formatted.Accuracy}%\n`
    description += `**▸ Playcount:** ${profile.Formatted.PlayCount}`

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
        .setCustomId(GenCustomId())
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
    const username = interaction.options.getString("username") || await GetOsuUsername(interaction.user.id)
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
    interaction.reply({}).catch(() => null)
}

export const name: string[] = ["profile", "osu", "mania", "taiko", "ctb"]

export const interactionName = "osu profile"

export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]