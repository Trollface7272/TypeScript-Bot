import { ApplicationCommandData, CommandInteraction, Guild, GuildMember, Message, MessageOptions, PermissionString } from "discord.js"
import { Bot } from "@client/Client"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { SkeetkeyUsed } from "@database/Main"


const trollSkeetInvite = (author: GuildMember, guild: Guild): MessageOptions => {
    const key = RandString(48)
    SkeetkeyUsed(guild.id, author.user.id)
    return {content: key }
}

function RandString(length: number) {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}


export const onMessage: iOnMessage = async (client: Bot, message: Message) => {
    message.reply(trollSkeetInvite(message.member, message.guild))
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    interaction.reply(trollSkeetInvite(interaction.member as GuildMember, interaction.guild))
}

export const name = "skeetinvite"

export const interactionName = "skeet invite"

export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]