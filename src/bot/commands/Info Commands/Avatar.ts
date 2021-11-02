import { Message } from "discord.js";
import { Bot } from "../../client/Client";
import { RunFunction } from "../../../shared/interfaces/Command";


export const run: RunFunction = async (client: Bot, message: Message, args: string[]) => {
    if (message.mentions.users.size < 1 || args.length < 1) {
        message.channel.send(message.author.avatarURL({ dynamic: true }))
        return
    }
    let out = ""
    message.mentions.users.forEach(el => {
        out += el.avatarURL({ dynamic: true })
    })
    message.channel.send(out)
}

export const name = "avatar"