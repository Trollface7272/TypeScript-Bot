import { ApplicationCommandData, CommandInteraction, Guild, GuildMember, Message, MessageOptions, PermissionString, Role } from "discord.js"
import { Bot, Embed } from "@client/Client"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { GetRetardRoles } from "@database/Guilds"

interface Response {
    code: number
    username?: string
    role?: string
    message?: string
}

const Unretard = async (author: GuildMember, guild: Guild, member: GuildMember): Promise<MessageOptions> => {
    if (!author.permissions.has("MANAGE_ROLES")) return SendResponse(author, { username: member.user.username, code: 2 })
    const roles: Array<Role> = [];
    (await GetRetardRoles(guild.id)).forEach(async el => {
        roles.push(guild.roles.cache.get(el) || await guild.roles.fetch(el))
    })
    for (let j = 0; j < roles.length; j++) {
        const role = roles[j]
        if (member.roles.cache.find(r => r.id == role?.id)) {
            if (j == 0) {
                await member.roles.remove(role)
                return SendResponse(author, { username: member.user.username, code: 4 })
            } else try {
                await member.roles.remove(role)
                await member.roles.add(roles[j - 1])
                return SendResponse(author, { username: member.user.username, role: roles[j - 1].name, code: 0 })
            } catch (err) {
                return HandleError(author, err, member)
            }
        }
    }
    return SendResponse(author, { username: member.user.username, code: 1 })
}

const SendResponse = (author: GuildMember, response: Response): MessageOptions => {
    let out = ""
    switch (response.code) {
        case 0:
            out = `Successfully set **${response.username}'s** role to \`${response.role}\`.`
            break
        case 1:
            out = `**${response.username}** is not retarded.`
            break
        case 2:
            out = `Can't change roles of **${response.username}** - Not enough permissions.`
            break
        case 3:
            out = `No user mentioned.`
            break
        case 4:
            out = `**${response.username}** is not retarded anymore.`
            break
        case 999:
            out = `Unhandled error - ${response.message}`
            break
        default:
            out = `Unknown error formatting response.`
            break
    }

    return ({ embeds: [Embed({ description: out }, author.user)] })
}

function HandleError(author: GuildMember, err: Error, member: GuildMember) {
    if (err.message.includes("Missing Permissions")) {
        return SendResponse(author, { username: member.user.username, code: 2 })
    }

    return SendResponse(author, { message: err.message, code: 999 })
}


export const onMessage: iOnMessage = async (client: Bot, message: Message) => {
    const member = message.mentions.members.first()

    if (!member) return message.channel.send({ embeds: [client.embed({ description: `No user mentioned.` }, message)] })
    message.reply(await Unretard(message.member, message.guild, member))
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    const member = interaction.options.getUser("user")

    interaction.reply(await Unretard(interaction.member as GuildMember, interaction.guild, interaction.guild.members.cache.get(member.id) || await interaction.guild.members.fetch(member.id)))
}

export const name = "unretard"
export const commandData: ApplicationCommandData = {
    name: "unretard",
    description: "Unretard.",
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