import { Message } from "discord.js"
import { Bot } from "../../client/Client"
import { RunFunction } from "../../../shared/interfaces/Command"


export const run: RunFunction = async (client: Bot, message: Message) => {
    const key = RandString(48)
    client.database.SkeetkeyUsed(client, message)
    message.channel.send(key)
}

function RandString(length: number) {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}

export const name = "skeetinvite"