import { ApplicationCommandData, CommandInteraction, Message, PermissionString } from "discord.js"
import { Bot } from "@client/Client"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { ClearTracking as dClearTracking } from "@database/Tracking"


const ClearTracking = async (channelId: string) => {
    dClearTracking(channelId)
}

export const onMessage: iOnMessage = async (client: Bot, message: Message) => {
    return (await ClearTracking(message.channel.id))
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    return (await ClearTracking(interaction.channel.id))
}

export const name: string[] = ["track clear", "tracking clear"]
export const commandData: ApplicationCommandData = {
    name: "osu track clear",
    description: "Clear tracking in this channel.",
    type: "CHAT_INPUT",
    defaultPermission: true
}
export const requiredPermissions: PermissionString[] = ["MANAGE_CHANNELS"]