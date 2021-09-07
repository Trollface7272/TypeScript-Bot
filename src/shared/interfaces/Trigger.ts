import { Bot } from "../../bot/client/Client"
import { Message } from "discord.js"

export interface RunFunction {
    (client: Bot, message: Message): Promise<void>
}

export interface Trigger {
    name: string | string[],
    regex: RegExp | RegExp[],
    category: string,
    run: RunFunction
}