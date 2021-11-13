import { Bot } from "@client/Client"
import { CommandInteraction, Message, MessageOptions, PermissionString } from "discord.js"

export interface iOnMessage {
    // eslint-disable-next-line
    (client: Bot, message: Message, args: string[]): Promise<string | MessageOptions | void>
}

export interface iOnSlashCommand {
    (interaction: CommandInteraction): Promise<void>
}

export interface Command {
    name: string | string[]
    interactionName: string
    requiredPermissions: PermissionString[]
    category: string,
    onMessage: iOnMessage
    onInteraction: iOnSlashCommand
}