import { RunFunction } from "../../../../shared/interfaces/Event"
import { Message } from "discord.js"
import { Command } from "../../../../shared/interfaces/Command"
import { Bot } from "../../../client/Client"
import { Filter } from "../../../moderation/Filter"

export const run: RunFunction = async (client: Bot, message: Message) => {
    if (message.author.bot || !message.guild) return
    client.database.OnMessage(client, message)
    //if (await Filter(client, message)) return
    const prefix = await client.database.Guilds.GetPrefix(client, message)
    client.triggers.forEach(el => {
        if (Array.isArray(el.regex)) {
            el.regex.forEach(e => {
                if (message.content.toLowerCase().match(e)) el.run(client, message)
            })
        } else if (typeof el.regex == "object") {
            if (message.content.toLowerCase().match(el.regex)) el.run(client, message)
        }
    })

    let isCommand = false
    for (let i = 0; i < prefix.length; i++)
        if (message.content.toLocaleLowerCase().startsWith(prefix[i])) isCommand = true
    if (!isCommand) return
    
    const args: string[] = message.content.slice(prefix.length).trim().split(/ +/g)
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

export const name: string = "messageCreate"