import { ApplicationCommandData, CommandInteraction, Message, MessageOptions, PermissionString } from "discord.js"
import { Bot } from "@client/Client"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"

const Invite = (): MessageOptions => {
    return {content: "https://discord.com/oauth2/authorize?client_id=584321366308814848&scope=bot&permissions=8"}
}

export const onMessage: iOnMessage = async (client: Bot, message: Message) => {
    message.reply(Invite())
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    interaction.reply(Invite())
}

export const name = "invite"
export const commandData: ApplicationCommandData = {
    name: "invite",
    description: "Get bot invite.",
    type: "CHAT_INPUT",
    defaultPermission: true
}
export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]