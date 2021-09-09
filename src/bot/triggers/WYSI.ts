import { Message } from "discord.js";
import { Bot } from "../client/Client";
import { RunFunction } from "../../shared/interfaces/Trigger";

const messages = [
    "727", "When you see it", "WHEN YOU SEE IT", "When you fucking see it", "WYSI", "727 WYSI", "WHEN YOU FUCKING SEE IT"
]
export const run: RunFunction = async (client: Bot, message: Message) => {
    message.reply({content: messages[Math.round(Math.random() * messages.length)], files: ["https://i.imgur.com/3sFZs6Q.gif"]})
}

export const name: string = "WYSI"
export const caseSensitive: boolean = false
export const matchEmotes: boolean = true
export const regex: RegExp = /(7|seven)[\s\/]*?(2|twenty)[\s\/]*?(7|seven)/