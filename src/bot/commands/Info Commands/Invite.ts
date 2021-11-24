import { CommandInteraction, MessageOptions, PermissionString } from "discord.js"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { Bot } from "@bot/client/Client"

const Invite = (client: Bot): MessageOptions => {
    let content = ""
    content = client.generateInvite({scopes: ["applications.commands"], permissions: ["ADMINISTRATOR"]})
    return {content}
}

export const onMessage: iOnMessage = async (client: Bot) => {
    return Invite(client)
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    interaction.reply(Invite(interaction.client as Bot))
}

export const name = "invite"

export const interactionName = "invite"

export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]