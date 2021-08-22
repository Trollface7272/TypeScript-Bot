import { RunFunction } from "../../interfaces/Event"
import { Message } from "discord.js"
import { Command } from "../../interfaces/Command"
import { Bot } from "../../client/Client"
import { Filter } from "../../moderation/Filter"

export const run: RunFunction = async (client: Bot, message: Message) => {
    if (message.author.bot || !message.guild) return
    client.database.OnMessage(client, message)
    //if (await Filter(client, message)) return
    const prefix = "!"

    if (!message.content.toLocaleLowerCase().startsWith(prefix)) return
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