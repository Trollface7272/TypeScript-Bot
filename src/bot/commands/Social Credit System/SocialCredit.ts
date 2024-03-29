import { CommandInteraction, Guild, GuildMember, Message, MessageOptions, PermissionString, User } from "discord.js"
import { Bot, Embed } from "@client/Client"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { IsSocialCreditEnabled, GetSocialCredit, SetSocialCredit as dSetSocialCredit, AddSocialCredit as dAddSocialCredit } from "@database/Guilds"


const SocialCredit = async (user: User, guild: Guild): Promise<MessageOptions> => {
    if (!(await IsSocialCreditEnabled(guild.id))) return ({
        embeds: [
            Embed({
                description: "Social credit system is not enabled on this server!"
            }, user)
        ]
    })
    const credit = await GetSocialCredit(guild.id, user.id)
    return ({
        embeds: [
            Embed({
                author: { name: "Glory to CCP!" },
                description: `Your current social credit score is \`${credit}\``
            }, user)
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
        default: 
            if (message.mentions.users.size == 1 && args.length == 1) return await SocialCredit(message.mentions.users.first(), message.guild) 
            return await SocialCredit(message.author, message.guild)
    }
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    interaction.reply(await SocialCredit(interaction.user, interaction.guild))
}

export const name: string[] = ["sc", "socialcredit"]

export const interactionName = "socialcredit"

export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]