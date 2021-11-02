import { Message } from "discord.js";
import { Bot } from "../../client/Client";
import { RunFunction } from "../../../shared/interfaces/Command";


export const run: RunFunction = async (client: Bot, message: Message) => {
    client.database.SkeetkeyUsed(client, message)
    message.channel.send(`GIFT-${RandString(5)}-${RandString(5)}-${RandString(5)}`)
}

function RandString(len: number) {
    let out = ""
    for(;len > 0; len--) out += String.fromCharCode(Random(65,91))
    return out
}

function Random(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export const name = "skeetkey"