import { Bot, Embed } from "@client/Client"
import { ClearRetardRoles } from "@database/Guilds"
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

const Clear = async (author: GuildMember, guild: Guild): Promise<MessageOptions> => {
    ClearRetardRoles(guild.id)
    return ({embeds: [Embed({description: `Successfully cleared retard roles list` }, author.user)], allowedMentions: {roles: []}})
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    interaction.reply(await Clear(interaction.member as GuildMember, interaction.guild))
}

export const onMessage: iOnMessage = async (client: Bot, message: Message) => {
    if (!message.member.permissions.has("ADMINISTRATOR")) return HandleError(client, message, 3)
        return await Clear(message.member, message.guild)
}


export const name = "retardroles clear"

export const interactionName = "retardroles clear"

export const requiredPermissions: PermissionString[] = ["ADMINISTRATOR"]