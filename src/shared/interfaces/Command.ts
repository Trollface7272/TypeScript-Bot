import { Bot } from "../../bot/client/Client"
import { Message } from "discord.js"

export interface RunFunction {
    (client: Bot, message: Message, args: string[]): Promise<any>
}

export interface Command {
    name: string | Array<string>,
    category: string,
    run: RunFunction
}