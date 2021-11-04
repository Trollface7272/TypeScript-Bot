import { Message } from "discord.js"
import { Bot } from "../../client/Client"
import { RunFunction } from "../../../interfaces/Command"


export const run: RunFunction = async (client: Bot, message: Message, args: Array<string>) => {
    await client.database.Users.SetOsuUsername(client, message, args[0])
    message.channel.send({embeds: [client.embed({description: `Successfully set your osu username to \`${args[0]}\``}, message)]})
}

export const name = "osuset"