import { Message } from "discord.js";
import { Bot } from "../../client/Client";
import { RunFunction } from "../../../shared/interfaces/Command";


export const run: RunFunction = async (client: Bot, message: Message, args: string[]) => {
    client.database.Guilds.SetPrefix(client, message, args.join(" "))
}

export const name: string = "setprefix"