import { channel } from "diagnostics_channel";
import { Message, Role } from "discord.js";
import { Bot } from "../../client/Client";
import { AddRetardRole } from "../../../shared/database/Guilds";
import { RunFunction } from "../../../shared/interfaces/Command";

const ErrorCodes = {
    "1": "Invalid syntax",
    "2": "Invalid role provided",
    "3": "Insufficient permissions",
}

export const run: RunFunction = async (client: Bot, message: Message, args: string[]) => {
    if (args[0] == "list") return List(client, message)
    if (args[0] == "add") return Add(client, message, args)
    if (args[0] == "remove") return Remove(client, message, args)
    if (args[0] == "clear") return Clear(client, message, args)
}

const List = async (client: Bot, message: Message) => {
    let roles = await client.database.Guilds.GetRetardRoles(client, message)
    let out = ""
    for (let i = 0; i < roles?.length; i++) {
        let role = message.guild.roles.cache.get(roles[i]) || await message.guild.roles.fetch(roles[i])
        out += `${i + 1}. <@&${role.id}>\n`
    }
    message.channel.send({ embeds: [client.embed({ description: out, title: "List of retard roles:" }, message)], allowedMentions: {roles: []} })
}

const Add = async (client: Bot, message: Message, args: string[]) => {
    if (!message.member.permissions.has("ADMINISTRATOR")) return HandleError(client, message, 3)
    let position = -1
    let offset = args[1] == "before" ? -1 : args[1] == "after" ? 0 : Infinity
    if (offset != Infinity) {
        if (isNaN(parseInt(args[2]))) { return HandleError(client, message, 1) }
        position = parseInt(args[2]) + offset
    }
    let role: Role
    if (message.mentions.roles.size > 0) {
        role = message.mentions.roles.first()
    } else {
        let id = offset == Infinity ? args[1] : args[3]
        if (!id) return HandleError(client, message, 1)
        role = message.guild.roles.cache.get(id) || await message.guild.roles.fetch(id)
    }
    if (!role) return HandleError(client, message, 2)
    AddRetardRole(client, message, role.id, position)
    message.channel.send({embeds: [client.embed({description: `Successfully added <@&${role.id}> to retard roles list` }, message)], allowedMentions: {roles: []}})
    client.logger.debug({position, offset, id:role.id,})
}

const Clear = async (client: Bot, message: Message, args: string[]) => {
    if (!message.member.permissions.has("ADMINISTRATOR")) return HandleError(client, message, 3)
    client.database.Guilds.ClearRetardRoles(client, message)
    message.channel.send({embeds: [client.embed({description: `Successfully cleared retard roles list` }, message)], allowedMentions: {roles: []}})
    client.logger.debug(`${message.author.username} cleared retard roles on ${message.guild.name}`)
}

const Remove = async (client: Bot, message: Message, args: string[]) => {
    if (!message.member.permissions.has("ADMINISTRATOR")) return HandleError(client, message, 3)
    let id: string
    if (message.mentions.roles.size > 0) id = message.mentions.roles.first().id
    else if (args[1] == "id") id = args[2]
    else if (isNaN(parseInt(args[1]))) return HandleError(client, message, 1)
    else {
        id = await client.database.Guilds.RemoveRetardRoleIndex(client, message, parseInt(args[1]))
        message.channel.send({embeds: [client.embed({description: `Successfully removed <@&${id}> from retard role list.` }, message)], allowedMentions: {roles: []}})
        return
    }
    client.database.Guilds.RemoveRetardRoleId(client, message, id)
    message.channel.send({embeds: [client.embed({description: `Successfully removed <@&${id}> from retard role list.` }, message)], allowedMentions: {roles: []}})
}

const HandleError = (client: Bot, message: Message, error: any) => {
    client.logger.debug(ErrorCodes[error] ? ErrorCodes[error] : error)
    message.channel.send({embeds: [client.embed({description: ErrorCodes[error]}, message)]})
}

export const name: string = "retardroles"