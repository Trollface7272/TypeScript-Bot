import { Bot, Embed } from "@client/Client"
import { RemoveRetardRoleId, RemoveRetardRoleIndex } from "@database/Guilds"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { ApplicationCommandData, CommandInteraction, Guild, GuildMember, Message, MessageOptions, PermissionString } from "discord.js"

const ErrorCodes = {
    "1": "Invalid syntax",
    "2": "Invalid role provided",
    "3": "Insufficient permissions",
}

const HandleError = (client: Bot, message: Message, error: any) => {
    client.logger.debug(ErrorCodes[error] ? ErrorCodes[error] : error)
    message.reply({embeds: [client.embed({description: ErrorCodes[error]}, message)]})
}

const Remove = async (author: GuildMember, guild: Guild, id: string): Promise<MessageOptions> => {
    RemoveRetardRoleId(guild.id, id)
    return ({embeds: [Embed({description: `Successfully removed <@&${id}> from retard role list.` }, author.user)], allowedMentions: {roles: []}})
}

const RemoveIndex = async (author: GuildMember, guild: Guild, index: number): Promise<MessageOptions> => {
    let id = await RemoveRetardRoleIndex(guild.id, index)
    return ({embeds: [Embed({description: `Successfully removed <@&${id}> from retard role list.` }, author.user)], allowedMentions: {roles: []}})
}

export const onMessage: iOnMessage = async (client: Bot, message: Message, args: string[]) => {
    let id: string
    if (message.mentions.roles.size > 0) id = message.mentions.roles.first().id
    else if (args[1] == "id") id = args[2]
    else if (isNaN(parseInt(args[1]))) return HandleError(client, message, 1)
    else {
        message.reply(await RemoveIndex(message.member, message.guild, parseInt(args[1])))
        return
    }    
    return message.reply(await Remove(message.member, message.guild, id))
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    let role = interaction.options.getRole("role")  
    return interaction.reply(await Remove(interaction.member as GuildMember, interaction.guild, role.id))
}


export const name = "retardroles remove"
export const commandData: ApplicationCommandData = {
    name: "retard roles remove",
    description: "Remove retard roles.",
    type: "CHAT_INPUT",
    options: [{
        name: "role",
        description: "Role to remove",
        type: "ROLE",
        required: true
    }],
    defaultPermission: true
}
export const requiredPermissions: PermissionString[] = ["ADMINISTRATOR"]