import { ApplicationCommandData, CommandInteraction, Guild, GuildMember, Message, MessageOptions, PermissionString } from "discord.js"
import { Bot, Embed } from "@client/Client"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { IsSocialCreditEnabled } from "@database/Guilds"
import { GetSocialCredit } from "@database/Users"


const SocialCredit = async (author: GuildMember, guild: Guild): Promise<MessageOptions> => {
    if (!(await IsSocialCreditEnabled(guild.id))) return ({embeds: [
        Embed({
            description: "Social credit system is not enabled on this server!"
        }, author.user)
    ]})
    const credit = await GetSocialCredit(author.user.id)
    return ({embeds: [
        Embed({
            author: {name: "Glory to CCP!"},
            description: `Your current social credit score is \`${credit}\``
        }, author.user)
    ]})
}

export const onMessage: iOnMessage = async (client: Bot, message: Message) => {
    return await SocialCredit(message.member, message.guild)
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    interaction.reply(await SocialCredit(interaction.member as GuildMember, interaction.guild))
}

export const name: string[] = ["sc", "socialcredit"]

export const interactionName = "socialcredit"

export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]