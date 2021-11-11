import { ApplicationCommandData, CommandInteraction, GuildMember, Message, MessageOptions, PermissionString } from "discord.js"
import { Bot, Embed } from "@client/Client"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { SetOsuUsername } from "@database/Users"
import { osuUsernameOption } from "@lib/Constants"

const osuSetUsername = (author: GuildMember, username: string): MessageOptions => {
    SetOsuUsername(author.id, username)
    return ({embeds: [Embed({description: `Successfully set your osu username to \`${username}\``}, author.user)]})
}

export const onMessage: iOnMessage = async (client: Bot, message: Message, args: Array<string>) => {
    if (!args[0]) return
    message.reply(osuSetUsername(message.member, args[0]))
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    interaction.reply(osuSetUsername(interaction.member as GuildMember, interaction.options.getString("username")))
}
export const name = "osuset"
export const commandData: ApplicationCommandData = {
    name: "osu set username",
    description: "Set your osu username.",
    options: [osuUsernameOption],
    type: "CHAT_INPUT",
    defaultPermission: true
}
export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]

