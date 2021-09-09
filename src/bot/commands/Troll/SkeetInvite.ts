import { Message } from "discord.js";
import { Bot } from "../../client/Client";
import { RunFunction } from "../../../shared/interfaces/Command";
import { MD5, SHA512 } from "crypto-js";


export const run: RunFunction = async (client: Bot, message: Message) => {
    let key = RandString(48)
    client.database.SkeetkeyUsed(client, message)
    message.channel.send(key)
}

function RandString(length: number) {
    var result = ''
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}

export const name: string = "skeetinvite"