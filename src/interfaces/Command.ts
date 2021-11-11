import { Bot } from "@client/Client"
import { ApplicationCommandData, CommandInteraction, Message, PermissionString } from "discord.js"

export interface iOnMessage {
    // eslint-disable-next-line
    (client: Bot, message: Message, args: string[]): Promise<any>
}

export interface iOnSlashCommand {
    (interaction: CommandInteraction): Promise<void>
}

export interface Command {
    name: string | Array<string>,
    commandData: ApplicationCommandData,
    requiredPermissions: PermissionString[]
    category: string,
    onMessage: iOnMessage
    onInteraction: iOnSlashCommand
}