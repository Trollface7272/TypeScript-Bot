import { Message } from "discord.js";
import { Bot } from "../../client/Client";
import { RunFunction } from "../../../interfaces/Command";
import { GetSocialCredit } from "../../../database/Users";
import { IsSocialCreditEnabled } from "../../../database/Guilds";


export const run: RunFunction = async (client: Bot, message: Message) => {
    if (!(await IsSocialCreditEnabled(client, message))) return message.reply({embeds: [
        client.embed({
            description: "Social credit system is not enabled on this server!"
        }, message)
    ]})
    const credit = await GetSocialCredit(client, message)
    message.reply({embeds: [
        client.embed({
            author: {name: "Glory to CCP"},
            description: `Your current social credit score is \`${credit}\``
        }, message)
    ]})
}

export const name: string[] = ["sc", "socialcredit"]