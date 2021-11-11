import { ApplicationCommandData, CommandInteraction, Guild, GuildMember, Message, MessageOptions, PermissionString, Role } from "discord.js"
import { Bot, Embed } from "@client/Client"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { GetRetardRoles } from "@database/Guilds"


export const Retard = async (author: GuildMember, guild: Guild, member: GuildMember): Promise<MessageOptions> => {
    const roles: Array<Role> = [];
    (await GetRetardRoles(guild.id)).forEach(async el => {
        roles.push(guild.roles.cache.get(el) || await guild.roles.fetch(el))
    })
    
    for (let j = 0; j < roles.length; j++) {
        const role = roles[j]
        if (member.roles.cache.find(r => r.id == role?.id)) {
            if (j < roles.length - 1) {
                try {
                    await member.roles.remove(role)
                    await member.roles.add(roles[j + 1])
                    return SendResponse({ username: member.user.username, role: roles[j + 1].name, code: 0 }, author)
                } catch (err) {
                    return HandleError(err, member, author)
                }
            }
            return SendResponse({ username: member.user.username, role: role.name, code: 1 }, author)
        }
    }
    try {
        await member.roles.add(roles[0])
        return SendResponse({ username: member.user.username, role: roles[0].name, code: 0 }, author)
    } catch (err) { return HandleError(err, member, author) }
}

interface Response {
    code: number
    username?: string
    role?: string
    message?: string
}

const SendResponse = (response: Response, author: GuildMember): MessageOptions => {
    let out = ""
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

    return { embeds: [Embed({ description: out }, author.user)] }
}

function HandleError(err: Error, member: GuildMember, author: GuildMember): MessageOptions {
    if (err.message.includes("Missing Permissions")) {
        return SendResponse({ username: member.user.username, code: 2 }, author)
    }

    return SendResponse({ message: err.message, code: 999 }, author)
}

export const onMessage: iOnMessage = async (client: Bot, message: Message) => {
    const member = message.mentions.members.first()
    if (!member) return message.reply({ embeds: [client.embed({ description: `No user mentioned.` }, message)] })

    message.reply(await Retard(message.member, message.guild, member))
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    const member = interaction.options.getUser("user")
    interaction.reply(await Retard((interaction.member as GuildMember), interaction.guild, interaction.guild.members.cache.get(member.id) || await interaction.guild.members.fetch(member.id)))
}

export const name = "retard"
export const commandData: ApplicationCommandData = {
    name: "retard",
    description: "Retard.",
    options: [{
        name: "user",
        description: "Target user.",
        type: "USER",
        required: true
    }],
    type: "CHAT_INPUT",
    defaultPermission: true
}
export const requiredPermissions: PermissionString[] = ["MANAGE_ROLES"]