import { CommandInteraction, EmbedField, Guild, GuildMember, Message, MessageOptions, PermissionString } from "discord.js"
import { Bot, Embed } from "@client/Client"
import { GetTrackedInChannel } from "@database/Tracking"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"

export const ListTracking = async (author: GuildMember, guild: Guild, channelId: string): Promise<MessageOptions> => {
    const tracked = await GetTrackedInChannel(channelId)
    const fields: EmbedField[] = []

    for (let i = 0; i < tracked.length; i++) {
        const e = tracked[i]
        fields.push({
            name: e.name,
            value: "\u200b",
            inline: true
        })
    }
    return ({embeds: [Embed({
        title: `Active tracked users in ${guild.name}:`,
        fields: fields
    }, author.user)]})
}

export const onMessage: iOnMessage = async (client: Bot, message: Message) => {
    return await ListTracking(message.member, message.guild, message.channel.id)
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    return interaction.reply(await ListTracking(interaction.member as GuildMember, interaction.guild, interaction.channel.id))
}

export const name: string[] = []

export const interactionName = "osu track list"

export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]