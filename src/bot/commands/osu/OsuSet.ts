import { CommandInteraction, GuildMember, Message, MessageOptions, PermissionString } from "discord.js"
import { Bot, Embed } from "@client/Client"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { SetOsuUsername } from "@database/Users"

const osuSetUsername = (author: GuildMember, username: string): MessageOptions => {
    SetOsuUsername(author.id, username)
    return ({embeds: [Embed({description: `Successfully set your osu username to \`${username}\``}, author.user)]})
}

export const onMessage: iOnMessage = async (client: Bot, message: Message, args: Array<string>) => {
    if (!args[0]) return
    return osuSetUsername(message.member, args[0])
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    interaction.reply(osuSetUsername(interaction.member as GuildMember, interaction.options.getString("username")))
}
export const name = "osuset"

export const interactionName = "osu set username"

export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]

