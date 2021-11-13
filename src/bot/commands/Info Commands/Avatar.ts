import { CommandInteraction, Message, MessageOptions, PermissionString, User } from "discord.js"
import { Bot } from "@client/Client"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"


const Avatar = (member: User): MessageOptions => {
    return {content: member.avatarURL({dynamic: true})}
}

export const onMessage: iOnMessage = async (client: Bot, message: Message, args: string[]) => {
    if (message.mentions.users.size < 1) 
        return Avatar(message.author)
    return Avatar(message.mentions.users.first())
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    const user = interaction.options.getUser("user") || interaction.user
    interaction.reply(Avatar(user))
}

export const name = "avatar"

export const interactionName = "avatar"

export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]