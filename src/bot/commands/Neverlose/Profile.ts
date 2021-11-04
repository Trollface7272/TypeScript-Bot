import { Message } from "discord.js";
import { Bot } from "../../client/Client";
import { RunFunction } from "../../../interfaces/Command";
import { GetProfile } from "../../../lib/Neverlose/Profile";


export const run: RunFunction = async (client: Bot, message: Message, args: string[]) => {
    if (args.length !== 1) return message.channel.send({
        embeds: [
            client.embed({description: "Please provide valid username."}, message)
        ]
    })
    client.logger.log(await GetProfile(args[1]))
}

export const name = "nl"