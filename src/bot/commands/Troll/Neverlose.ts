import { Message } from "discord.js"
import { Bot } from "../../client/Client"
import { RunFunction } from "../../../shared/interfaces/Command"


export const run: RunFunction = async (client: Bot, message: Message, args: string[]) => {
    seed = 0
    args.join(" ").split("").forEach(el => seed += el.charCodeAt(0))
    let link = `https://neverlose.cc/activate?code=${RandString(20)}`
    message.channel.send(link)
}


function RandString(length: number) {
    var result = ''
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(random() * charactersLength))
    }
    return result
}
var seed = 1
function random() {
    var x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
}

export const name: string = "neverlose"