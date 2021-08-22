import { Message } from "discord.js"
import { Bot } from "../../client/Client"
import { Filter } from "../../database/Guilds"
import { RunFunction } from "../../interfaces/Command"

const ParseMessage = async (client: Bot, message: Message, args: string[]) => {
    if (args[0] === "add") {
        if (args.length < 4) throw 1
        if (args[1] !== "regex" && args[1] !== "word") throw 1
        return { action: "add", data: { type: args[1] as "regex" | "word", name: args[2].replace(/(_)/gm, " "), match: args.slice(3).join(" "), bypass_roles: [] } }
    }
    if (args[0] == "remove" || args[0] == "delete") {
        if (args.length < 2) throw 1
        return { action: "remove", data: args[1].replace(/(_)/gm, " ") }
    }

    if (args[0] == "display" || args[0] == "show") {
        return { action: "show", data: await client.database.GetFilter(client, message) }
    }
}

const error = (client: Bot, message: Message, code: any) => {
    switch (code) {
        case 1: return message.channel.send({embeds: [client.embed({ description: "Invalid syntax" }, message)]})

        default:
            message.channel.send({embeds: [client.embed({ description: "Unknown error" + code.message }, message)]})
            return client.logger.error(new Error(code))
    }
}

const AddFilter = async (client: Bot, message: Message, filter: Filter) => {
    if (filter.match == "") throw 1
    await client.database.AddFilter(client, message, filter)
    message.channel.send({embeds: [client.embed({ description: `Successfully added \`${filter.match}\` as a ${filter.type} filter.` }, message)]})
}

const RemoveFilter = async (client: Bot, message: Message, name: string) => {
    await client.database.RemoveFilter(client, message, name)
    message.channel.send({embeds: [client.embed({ description: `Successfully removed ${name} from filters.` }, message)]})
}

const ShowFilter = async (client: Bot, message: Message, filters: Array<Filter>) => {
    let fields = []
    for (let i = 0; i < filters.length; i++) {
        fields.push({
            name: filters[i].name,
            value: `Match: \`${filters[i].match}\`\nType: ${filters[i].type}`,
            inline: true
        })
    }
    message.channel.send({embeds: [client.embed({
        title: `Active filters for ${message.guild.name}:`,
        fields: fields
    }, message)]})
}

export const run: RunFunction = async (client: Bot, message: Message, args: string[]) => {
    try {
        let data = await ParseMessage(client, message, args)
        if (data?.action == "add") return AddFilter(client, message, data.data as Filter)
        if (data?.action == "show") return ShowFilter(client, message, data.data as Array<Filter>)
        if (data?.action == "remove") return RemoveFilter(client, message, data.data as string)
    } catch (e) {
        error(client, message, e)
    }
}

export const name: string = "filter"