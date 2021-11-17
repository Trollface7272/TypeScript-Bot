import { CommandInteraction, MessageOptions, PermissionString } from "discord.js"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"

const Invite = (): MessageOptions => {
    return {content: "https://discord.com/oauth2/authorize?client_id=584321366308814848&scope=bot&permissions=8"}
}

export const onMessage: iOnMessage = async () => {
    return Invite()
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    interaction.reply(Invite())
}

export const name = "invite"

export const interactionName = "invite"

export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]