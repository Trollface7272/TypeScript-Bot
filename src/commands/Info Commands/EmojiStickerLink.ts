import { Message } from "discord.js";
import { Bot } from "../../client/Client";
import { RunFunction } from "../../interfaces/Command";


export const run: RunFunction = async (client: Bot, message: Message, args: string[]) => {
    if (message.stickers.size < 1 && args.length < 1) return
    let out = ""
    message.stickers.forEach(el => {
        out += el.url + "\n"
    })
    args.forEach(el => {
        if (!el.includes("<:") && !el.includes("<a:")) return
        let arr = el.substr(0, el.length - 1).split(":")
        arr.shift()
        out += `https://cdn.discordapp.com/emojis/${arr[1]}.${el.includes("<a:") ? "gif" : "png"}?v=1\n`
    })
    message.channel.send(out)
}

export const name: string = "link"