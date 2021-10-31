import { Message } from "discord.js";
import { Bot } from "../../client/Client";
import { RunFunction } from "../../../shared/interfaces/Command";


export const run: RunFunction = async (client: Bot, message: Message) => {
    message.channel.send(`https://prnt.sc/${RandString(6)}`)
}

function RandString(length: number) {
    var result = ''
    var characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}

export const name: string[] = ["prntsc"]