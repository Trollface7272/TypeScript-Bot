import { CommandInteraction, GuildMember, Message, MessageEmbed, MessageOptions, PermissionString } from "discord.js"
import { Bot } from "@client/Client"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { GetOsuUsername } from "@database/Users"
import { Profile } from "@interfaces/OsuApi"
import { GetProfile } from "@lib/osu/Api/Api"
import { ModNames, GetFlagUrl, GetProfileLink, GetServer, GetProfileImage, HandleError, Args, ParseArgs } from "@lib/osu/Utils"

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
    return ({ embeds: [embed] })
}

export const onMessage: iOnMessage = async (client: Bot, message: Message, args: string[]) => {
    const options = await ParseArgs(message, args)
    return await osuProfile(message.member, options)
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
}

export const name: string[] = ["profile", "osu", "mania", "taiko", "ctb"]

export const interactionName = "osu profile"

export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]