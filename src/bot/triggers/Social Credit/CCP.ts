import { Message } from "discord.js"
import { Bot } from "@client/Client"
import { RunFunction } from "@interfaces/Trigger"
import { IsSocialCreditEnabled, AddSocialCredit } from "@database/Guilds"

const good = 
`ATTENTION CITIZEN! 市民请注意!
Your social credit score has increased by \`5\`, keep up the good work!
为党争光! Glory to the CCP!`

const bad = 
`ATTENTION CITIZEN! 市民请注意!
Your social credit score has lowered by \`10\`, continue like this and we will have to send our agents and you will have to go through reeducation camp!
为党争光! Glory to the CCP!`

let used = []

export const run: RunFunction = async (client: Bot, message: Message) => {
    if (!(await IsSocialCreditEnabled(message.guild.id))) return
    if (used.includes(message.author.id)) return
    const lcMsg = message.content.toLowerCase()
    if (lcMsg.match(/(taiwan|:flag_tw:|🇹🇼).*(is not|isn.t).*(country|real)/) || lcMsg.match(/(taiwan|:flag_tw:|🇹🇼).*(is).*(?!not|n't|nt|n t).*(china|🇨🇳|ccp)/) || lcMsg.match(/(taiwan|:flag_tw:|🇹🇼).*(|does(.)n(o)?t).*(exist)/)) {
        AddSocialCredit(message.guild.id, message.author.id, 5)
        message.reply(good)
    } else {
        AddSocialCredit(message.guild.id, message.author.id, -10)
        message.reply(bad)
    }
    used.push(message.author.id)
}

setInterval(() => {
    used = []
}, 1000 * 60 * 60)

export const name = "CCP"
export const caseSensitive = false
export const matchEmotes = true
export const regex = /(taiwan|:flag_tw:|🇹🇼)/