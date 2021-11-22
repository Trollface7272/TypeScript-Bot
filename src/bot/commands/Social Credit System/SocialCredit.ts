import { CommandInteraction, Guild, GuildMember, Message, MessageOptions, PermissionString, User } from "discord.js"
import { Bot, Embed } from "@client/Client"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { IsSocialCreditEnabled, GetSocialCredit, SetSocialCredit as dSetSocialCredit, AddSocialCredit as dAddSocialCredit } from "@database/Guilds"


const SocialCredit = async (author: GuildMember, guild: Guild): Promise<MessageOptions> => {
    if (!(await IsSocialCreditEnabled(guild.id))) return ({
        embeds: [
            Embed({
                description: "Social credit system is not enabled on this server!"
            }, author.user)
        ]
    })
    const credit = await GetSocialCredit(guild.id, author.user.id)
    return ({
        embeds: [
            Embed({
                author: { name: "Glory to CCP!" },
                description: `Your current social credit score is \`${credit}\``
            }, author.user)
        ]
    })
}

const SetSocialCredit = async (author: GuildMember, guild: Guild, user: User, amount: number) => {
    if (isNaN(amount) || !author.permissions.has("MANAGE_ROLES")) return
    dSetSocialCredit(guild.id, user.id, amount)
    return {embeds: [Embed({
        description: `Successfully set ${user.username}'s social credit to ${amount}`
    }, author.user)]}
}

const AddSocialCredit = async (author: GuildMember, guild: Guild, user: User, amount: number) => {
    if (isNaN(amount) || !author.permissions.has("MANAGE_ROLES")) return
    dAddSocialCredit(guild.id, user.id, amount)
    return {embeds: [Embed({
        description: `Successfully set ${user.username}'s social credit to ${await GetSocialCredit(guild.id, user.id)}`
    }, author.user)]}
}

export const onMessage: iOnMessage = async (client: Bot, message: Message, args: string[]) => {
    switch (args[0]) {
        case "set": return await SetSocialCredit(message.member, message.guild, message.mentions.users.first(), (!isNaN(parseInt(args[1]))) ? parseInt(args[1]) : parseInt(args[2]))
        case "add": return await AddSocialCredit(message.member, message.guild, message.mentions.users.first(), (!isNaN(parseInt(args[1]))) ? parseInt(args[1]) : parseInt(args[2]))
        default: return await SocialCredit(message.member, message.guild)
    }
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    interaction.reply(await SocialCredit(interaction.member as GuildMember, interaction.guild))
}

export const name: string[] = ["sc", "socialcredit"]

export const interactionName = "socialcredit"

export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]