import { Message } from "discord.js"
import { Bot } from "@client/Client"
import { RunFunction } from "@interfaces/Trigger"

const messages = [
    "727", "When you see it", "WHEN YOU SEE IT", "When you fucking see it", "WYSI", "727 WYSI", "WHEN YOU FUCKING SEE IT"
]
export const run: RunFunction = async (client: Bot, message: Message) => {
    if (message.content.toLowerCase().includes("trollface7272@post.cz")) return
    if (message.guild.id === "524904361336504320") return
    await message.reply({content: messages[Math.round(Math.random() * messages.length)], files: ["https://i.imgur.com/3sFZs6Q.gif"]})
}

export const name = "WYSI"
export const caseSensitive = false
export const matchEmotes = true
export const regex = /(7|seven)[\s/]*?(2|twenty)[\s/]*?(7|seven)/