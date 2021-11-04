import { Message } from "discord.js"
import { Bot } from "../../client/Client"
import { RunFunction } from "../../../interfaces/Command"


export const run: RunFunction = async (client: Bot, message: Message, args: string[]) => {
    if (args.length < 1) {
        message.channel.send({
            embeds: [client.embed(
                {
                    description: `Please provide your neverlose username.`
                }, message)]
        })
        return
    }
    seed = 0
    args.join(" ").split("").forEach(el => seed += el.charCodeAt(0))
    const link = `https://neverlose.cc/activate?code=${RandString(20)}`
    client.database.SkeetkeyUsed(client, message)
    message.channel.send(link)
}


function RandString(length: number) {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(random() * charactersLength))
    }
    return result
}
let seed = 1
function random() {
    const x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
}

export const name = "neverlose"