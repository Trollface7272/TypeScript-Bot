import { Bot, Embed } from "@client/Client"
import { RemoveRetardRoleId, RemoveRetardRoleIndex } from "@database/Guilds"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { CommandInteraction, Guild, GuildMember, Message, MessageOptions, PermissionString } from "discord.js"

const ErrorCodes = {
    "1": "Invalid syntax",
    "2": "Invalid role provided",
    "3": "Insufficient permissions",
}

const HandleError = (client: Bot, message: Message, error: number) => {
    client.logger.debug(ErrorCodes[error] ? ErrorCodes[error] : error)
    return {embeds: [client.embed({description: ErrorCodes[error]}, message)]}
}

const Remove = async (author: GuildMember, guild: Guild, id: string): Promise<MessageOptions> => {
    RemoveRetardRoleId(guild.id, id)
    return ({embeds: [Embed({description: `Successfully removed <@&${id}> from retard role list.` }, author.user)], allowedMentions: {roles: []}})
}

const RemoveIndex = async (author: GuildMember, guild: Guild, index: number): Promise<MessageOptions> => {
    const id = await RemoveRetardRoleIndex(guild.id, index)
    return ({embeds: [Embed({description: `Successfully removed <@&${id}> from retard role list.` }, author.user)], allowedMentions: {roles: []}})
}

export const onMessage: iOnMessage = async (client: Bot, message: Message, args: string[]) => {
    let id: string
    if (message.mentions.roles.size > 0) id = message.mentions.roles.first().id
    else if (args[1] == "id") id = args[2]
    else if (isNaN(parseInt(args[1]))) return HandleError(client, message, 1)
    else {
        return await RemoveIndex(message.member, message.guild, parseInt(args[1]))
    }    
    return await Remove(message.member, message.guild, id)
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    const role = interaction.options.getRole("role")  
    return interaction.reply(await Remove(interaction.member as GuildMember, interaction.guild, role.id))
}


export const name = "retardroles remove"

export const interactionName = "retardroles remove"

export const requiredPermissions: PermissionString[] = ["ADMINISTRATOR"]