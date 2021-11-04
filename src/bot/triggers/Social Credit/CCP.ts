import { Message } from "discord.js";
import { Bot } from "../../client/Client";
import { RunFunction } from "../../../interfaces/Trigger";
import { IsSocialCreditEnabled } from "../../../database/Guilds";
import { AddSocialCredit } from "../../../database/Users";

const good = 
`ATTENTION CITIZEN! 市民请注意!
Your social credit score has increased by \`5\`, keep up the good work!
为党争光! Glory to the CCP!`

const bad = 
`ATTENTION CITIZEN! 市民请注意!
Your social credit score has lowered by \`10\`, continue like this and we will have to send our agents and you will have to go through reeducation camp!
为党争光! Glory to the CCP!`


export const run: RunFunction = async (client: Bot, message: Message) => {
    if (!(await IsSocialCreditEnabled(client, message))) return
    let lcMsg = message.content.toLowerCase()
    if (lcMsg.match(/(taiwan|:flag_tw:|🇹🇼).*(is not|isn.t).*(country|real)/) || lcMsg.match(/(taiwan|:flag_tw:|🇹🇼).*(is).*(?!not).*(china|🇨🇳)/) || lcMsg.match(/(taiwan|:flag_tw:|🇹🇼).*(does not|doesn.t).*(exist)/)) {
        AddSocialCredit(client, message, 5)
        message.reply(good)
    } else {
        AddSocialCredit(client, message, -10)
        message.reply(bad)
    }
}

export const name = "CCP"
export const caseSensitive = false
export const matchEmotes = true
export const regex = /(taiwan|:flag_tw:|🇹🇼)/