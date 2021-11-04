import { GuildMember, Message, Role } from "discord.js";
import { Bot } from "../../client/Client";
import { GetRetardRoles } from "../../../database/Guilds";
import { RunFunction } from "../../../interfaces/Command";


export const run: RunFunction = async (client: Bot, message: Message) => {
    if (!message.member.permissions.has("MANAGE_ROLES")) { message.channel.send({ embeds: [client.embed({ description: "Insufficient permissions." }, message)] }); return }
    const member = message.mentions.members.first()
    const roles: Array<Role> = [];
    (await GetRetardRoles(client, message)).forEach(async el => {
        roles.push(message.guild.roles.cache.get(el) || await message.guild.roles.fetch(el))
    })
    if (!member) return SendResponse(client, message, { code: 3 })
    for (let j = 0; j < roles.length; j++) {
        const role = roles[j]
        if (member.roles.cache.find(r => r.id == role?.id)) {
            if (j < roles.length - 1) {
                try {
                    await member.roles.remove(role)
                    await member.roles.add(roles[j + 1])
                    return SendResponse(client, message, { username: member.user.username, role: roles[j + 1].name, code: 0 })
                } catch (err) {
                    return HandleError(client, message, err, member)
                }
            }
            return SendResponse(client, message, { username: member.user.username, role: role.name, code: 1 })
        }
    }
    try {
        await member.roles.add(roles[0])
        return SendResponse(client, message, { username: member.user.username, role: roles[0].name, code: 0 })
    } catch (err) { return HandleError(client, message, err, member) }
}

interface Response {
    code: number
    username?: string
    role?: string
    message?: string
}

const SendResponse = (client: Bot, message: Message, response: Response) => {
    let out = ""
    client.logger.debug(response)
    switch (response.code) {
        case 0:
            out = `Successfully set **${response.username}'s** role to \`${response.role}\`.`
            break
        case 1:
            out = `**${response.username}** already has the highest role.`
            break
        case 2:
            out = `Can't change roles of **${response.username}** - Not enough permissions.`
            break
        case 3:
            out = `No user mentioned.`
            break
        case 999:
            out = `Unhandled error - ${response.message}`
            break
        default:
            out = `Unknown error formatting response.`
            break
    }

    message.channel.send({ embeds: [client.embed({ description: out }, message)] })
}

function HandleError(client: Bot, message: Message, err: Error, member: GuildMember) {
    if (err.message.includes("Missing Permissions")) {
        return SendResponse(client, message, { username: member.user.username, code: 2 })
    }

    return SendResponse(client, message, { message: err.message, code: 999 })
}


export const name = "retard"