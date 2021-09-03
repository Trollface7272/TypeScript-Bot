import { Message } from "discord.js";
import { Bot } from "../../client/Client";
import { RunFunction } from "../../../shared/interfaces/Command";
import { MD5, SHA512 } from "crypto-js";


export const run: RunFunction = async (client: Bot, message: Message) => {
    let key = SHA512(Date.now().toString()).toString().substr(0,28)
    message.channel.send(key)
}

export const name: string = "skeetinvite"