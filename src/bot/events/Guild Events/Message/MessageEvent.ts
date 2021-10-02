import { RunFunction } from "../../../../shared/interfaces/Event"
import { Message } from "discord.js"
import { Command } from "../../../../shared/interfaces/Command"
import { Bot } from "../../../client/Client"
import { Filter } from "../../../moderation/Filter"

export const run: RunFunction = async (client: Bot, message: Message) => {
    if (message.author.bot || !message.guild) return
    client.database.OnMessage(client, message)
    
    //if (await Filter(client, message)) return
    var prefix: string[]
    if (process.argv.indexOf("-prefix") !== -1) prefix = [process.argv[process.argv.indexOf("-prefix") + 1]]
    else prefix = await client.database.Guilds.GetPrefix(client, message)
    RunTrigger(client, message)

    let isCommand = false
    for (let i = 0; i < prefix.length; i++)
        if (message.content.toLocaleLowerCase().startsWith(prefix[i])) isCommand = true
    if (!isCommand) return
    const args: string[] = message.content.slice(prefix.length).trim().split(/ +/g)

    RunCommand(client, message, args)
    
}
// /(:[^:\s]+:|<:[^:\s]+:[0-9]+>|<a:[^:\s]+:[0-9]+>)/g
const RunCommand = (client: Bot, message: Message, args: string[]) => {
    const cmd: string = args.shift()
    const command: Command = client.commands.get(cmd)
    
    if (!command) return
    client.database.OnCommand(client, message)
    command.run(client, message, args).catch((reason: any) => {
        message.channel.send({embeds: [client.embed({
            description: `Unexpected error: ${reason}`
        }, message)]})
        client.logger.error((reason))
    })
}

const RunTrigger = (client: Bot, message: Message) => {
    client.triggers.forEach(el => {
        let content = el.caseSensitive ? message.content : message.content.toLowerCase()
        let emojis = content.match(/(:[^:\s]+:|<:[^:\s]+:[0-9]+>|<a:[^:\s]+:[0-9]+>)/g)
        emojis?.forEach(e => {
            if (el.matchEmotes) content = content.replace(e.split(":")[2], "")
            else content = content.replace(e, "")
        })
        if (!Array.isArray(el.regex)){ if (content.match(el.regex)) el.run(client, message) }
        else {
            el.regex.forEach(e => {
                if (content.match(e)) el.run(client, message)
            })
        }
    })
}

export const name: string = "messageCreate"