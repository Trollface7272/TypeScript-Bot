import { Message } from "discord.js";
import { Bot } from "../../client/Client";
import { RunFunction } from "../../../interfaces/Command";


export const run: RunFunction = async (client: Bot, message: Message) => {
    message.channel.send("https://discord.com/oauth2/authorize?client_id=584321366308814848&scope=bot&permissions=8")
}

export const name = "invite"