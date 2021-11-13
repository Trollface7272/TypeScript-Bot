import { ApplicationCommandData, CommandInteraction, EmbedField, Guild, GuildMember, Message, MessageOptions, PermissionString } from "discord.js"
import { Bot, Embed } from "@client/Client"
import { GetTrackedInChannel } from "@database/Tracking"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { GetProfileCache } from "@lib/osu/Api/Api"

const ListTracking = async (author: GuildMember, guild: Guild, channelId: string): Promise<MessageOptions> => {
    const tracked = await GetTrackedInChannel(channelId)
    const fields: EmbedField[] = []

    for (let i = 0; i < tracked.length; i++) {
        const e = tracked[i];
        const profile = await GetProfileCache({u: e.id, m: e.m})
        fields.push({
            name: profile.Name,
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

export const name: string[] = ["track list", "tracking list"]

export const interactionName = "osu track list"

export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]