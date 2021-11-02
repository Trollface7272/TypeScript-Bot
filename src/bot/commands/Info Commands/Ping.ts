import { Message } from "discord.js";
import { RunFunction } from "../../../shared/interfaces/Command";


export const run: RunFunction = async (client, message) => {
    const msg: Message = await message.channel.send("Pinging")
    await msg.edit({embeds: [client.embed({description: `WebSocket: ${client.ws.ping}ms\n Message edit: ${msg.createdAt.getTime() - message.createdAt.getTime()}ms`}, message)]})
}

export const name = "ping"