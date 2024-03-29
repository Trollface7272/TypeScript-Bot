import { Message } from "discord.js"
import { Bot } from "../client/Client"
import { GetFilter, iFilter as FilterType } from "../../database/Guilds"


const Regex = (client: Bot, message: Message, filter: FilterType): boolean => {
    return message.content.match(new RegExp(filter.match, "gmi"))?.length > 0
}

const Word = (client: Bot, message: Message, filter: FilterType): boolean => {
    return message.content.toLowerCase().includes(filter.match)
}


export const Filter = async (client: Bot, message: Message) => {
    const filter = await GetFilter(message.guild.id)
    if (!filter) return
    client.logger.log(filter)
    for (let i = 0; i < filter.length; i++) {
        const el = filter[i];
        const res: boolean = el.type == "regex" ? Regex(client, message, el) : Word(client, message, el)
        if (res) {
            message.delete()
            return true
        }
    }
    return false
}