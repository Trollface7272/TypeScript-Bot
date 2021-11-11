import { Bot, Embed } from "@client/Client"
import { AddRetardRole } from "@database/Guilds"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { ApplicationCommandData, CommandInteraction, Guild, GuildMember, Message, MessageOptions, PermissionString, Role } from "discord.js"

const ErrorCodes = {
    "1": "Invalid syntax",
    "2": "Invalid role provided",
    "3": "Insufficient permissions",
}

const HandleError = (client: Bot, message: Message, error: any) => {
    client.logger.debug(ErrorCodes[error] ? ErrorCodes[error] : error)
    message.reply({embeds: [client.embed({description: ErrorCodes[error]}, message)]})
}

const Add = async (author: GuildMember, guild: Guild, position: number, role: Role): Promise<MessageOptions> => {
    AddRetardRole(guild.id, role.id, position)
    return ({embeds: [Embed({description: `Successfully added <@&${role.id}> to retard roles list` }, author.user)], allowedMentions: {roles: []}})
}

export const onMessage: iOnMessage = async (client: Bot, message: Message, args: string[]) => {
    let position = -1
    const offset = args[1] == "before" ? -1 : args[1] == "after" ? 0 : Infinity
    if (offset != Infinity) {
        if (isNaN(parseInt(args[2]))) { return HandleError(client, message, 1) }
        position = parseInt(args[2]) + offset
    }
    let role: Role
    if (message.mentions.roles.size > 0) {
        role = message.mentions.roles.first()
    } else {
        const id = offset == Infinity ? args[1] : args[3]
        if (!id) return HandleError(client, message, 1)
        role = message.guild.roles.cache.get(id) || await message.guild.roles.fetch(id)
    }
    if (!role) return HandleError(client, message, 2)
    return message.reply(await Add(message.member, message.guild, position, role))
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    let position = interaction.options.getNumber("position") || -1
    let role: Role = interaction.options.getRole("role") as Role

    return interaction.reply(await Add(interaction.member as GuildMember, interaction.guild, position, role))
}


export const name = "retardroles add"
export const commandData: ApplicationCommandData = {
    name: "retard roles add",
    description: "List retard roles.",
    type: "CHAT_INPUT",
    options: [{
        name: "role",
        description: "Role to add to retard roles.",
        type: "ROLE",
        required: true
    }, {
        name: "position",
        description: "Position of this role.",
        type: "NUMBER",
        required: false
    }],
    defaultPermission: true
}
export const requiredPermissions: PermissionString[] = ["ADMINISTRATOR"]