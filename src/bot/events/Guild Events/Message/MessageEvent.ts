import { RunFunction } from "@interfaces/Event"
import { Message, MessageOptions } from "discord.js"
import { Command } from "@interfaces/Command"
import { Bot } from "@client/Client"

export const run: RunFunction = async (client: Bot, message: Message) => {
    if (message.author.bot || !message.guild) return
    client.database.OnMessage(message.guild, message.member)

    //if (await Filter(client, message)) return
    let prefix: string[]
    if (process.argv.indexOf("-prefix") !== -1) prefix = [process.argv[process.argv.indexOf("-prefix") + 1]]
    else prefix = await client.database.Guilds.GetPrefix(message.guild.id)

    RunTrigger(client, message)

    let selectedPrefix = -1
    for (let i = 0; i < prefix.length; i++)
        if (message.content.toLocaleLowerCase().startsWith(prefix[i])) selectedPrefix = i

    if (selectedPrefix == -1) return
    const args: string[] = message.content.slice(prefix[selectedPrefix].length).trim().split(/ +/g)

    RunCommand(client, message, args)

}
// /(:[^:\s]+:|<:[^:\s]+:[0-9]+>|<a:[^:\s]+:[0-9]+>)/g
const RunCommand = async (client: Bot, message: Message, args: string[]) => {
    const cmd: string = args.shift()
    const command: Command = client.commands.get(cmd)

    if (!command) return
    if (!message.member.permissions.has(command.requiredPermissions)) return message.channel.send({ embeds: [client.embed({ description: "Insufficient permissions." }, message)] })
    client.database.OnCommand(message.guild.id, message.author.id)
    // eslint-disable-next-line
    const resp = await command.onMessage(client, message, args).catch((reason: any) => {
        message.channel.send({
            embeds: [client.embed({
                description: `Unexpected error: ${reason}`
            }, message)]
        })
        client.logger.error((reason))
    })
    if (resp) Reply(message, resp as string | MessageOptions)
}

const RunTrigger = (client: Bot, message: Message) => {
    client.triggers.forEach(el => {
        let content = el.caseSensitive ? message.content : message.content.toLowerCase()
        const emojis = content.match(/(:[^:\s]+:|<:[^:\s]+:[0-9]+>|<a:[^:\s]+:[0-9]+>)/g)
        emojis?.forEach(e => {
            if (el.matchEmotes) content = content.replace(e.split(":")[2], "")
            else content = content.replace(e, "")
        })
        if (!Array.isArray(el.regex)) { if (content.match(el.regex)) el.run(client, message) }
        else {
            el.regex.forEach(e => {
                if (content.match(e)) el.run(client, message)
            })
        }
    })
}

const Reply = (message: Message, data: string | MessageOptions) => {
    if (typeof data === "string") data = {
        allowedMentions: { repliedUser: false },
        content: data
    } as MessageOptions
    else if (!data.allowedMentions) data.allowedMentions = { repliedUser: false }
    message.reply(data)
}

export const name = "messageCreate"