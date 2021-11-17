import { Bot } from "@client/Client"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { CommandInteraction, Message, PermissionString } from "discord.js"

const Ping = async (client: Bot, msg: Message) => {
    msg.edit({embeds: [client.embed({description: `WebSocket: ${client.ws.ping}ms\n Message edit: ${msg.createdAt.getTime() - msg.createdAt.getTime()}ms`}, msg)]})
}

export const onMessage: iOnMessage = async (client: Bot, message: Message) => {
    Ping(client, await message.reply("Pinging!"))
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    Ping(interaction.client as Bot, await interaction.channel.send("Pinging!"))
}

export const name = "ping"

export const interactionName = "ping"

export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]