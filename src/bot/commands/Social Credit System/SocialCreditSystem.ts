import { ApplicationCommandData, CommandInteraction, GuildMember, Message, PermissionString } from "discord.js"
import { Bot, Embed } from "@client/Client"
import { SetSocialCredit } from "@database/Guilds"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"


const ToggleSocialCredit = (author: GuildMember, guildId: string, enable: boolean) => {
    SetSocialCredit(guildId, enable)
    return ({embeds: [
        Embed({
            description: `Successfully ${enable ? "enabled" : "disabled"} social credit system.`
        }, author.user)
    ]})
}

export const onMessage: iOnMessage = async (client: Bot, message: Message, args: string[]) => {
    switch(args[0]) {
        case "enable":  return ToggleSocialCredit(message.member, message.guild.id, true)
        case "disable": return ToggleSocialCredit(message.member, message.guild.id, false)
    }
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {

}

export const name = "socialcreditsystem"

export const interactionName = "socialcreditsystem"

export const requiredPermissions: PermissionString[] = ["ADMINISTRATOR"]