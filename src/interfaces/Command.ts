import { Bot } from "@client/Client"
import { ButtonInteraction, CommandInteraction, Message, MessageOptions, PermissionString, SelectMenuInteraction } from "discord.js"

export interface iOnMessage {
    // eslint-disable-next-line
    (client: Bot, message: Message, args: string[]): Promise<string | MessageOptions | void>
}

export interface iOnSlashCommand {
    (interaction: CommandInteraction): Promise<void>
}

export interface iOnButton {
    (interaction: ButtonInteraction): Promise<void>
}

export interface iOnSelectMenu {
    (interaction: SelectMenuInteraction): Promise<void>
}

export interface Command {
    name: string | string[]
    interactionName: string
    requiredPermissions: PermissionString[]
    category: string,
    onMessage: iOnMessage
    onInteraction: iOnSlashCommand
}