import { CommandInteraction, Message, MessageOptions, PermissionString } from "discord.js"
import { Bot } from "@client/Client"
import { SetPrefix as SetPrefixDb } from "@database/Guilds"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"


export const SetPrefix = (guildId: string, prefix: string): MessageOptions => {
    SetPrefixDb(guildId, prefix)
    return {content: `Successfully set prefix to ${prefix}`}
}

export const onMessage: iOnMessage = async (client: Bot, message: Message, args: string[]) => {
    return SetPrefix(message.guildId, args.join(" "))
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    interaction.reply(SetPrefix(interaction.guild.id, interaction.options.getString("prefix")))
}

export const name = "setprefix"

export const interactionName = "set prefix"

export const requiredPermissions: PermissionString[] = ["ADMINISTRATOR"]