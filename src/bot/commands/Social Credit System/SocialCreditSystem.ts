import { ApplicationCommandData, GuildMember, Message, PermissionString } from "discord.js"
import { Bot, Embed } from "@client/Client"
import { SetSocialCredit } from "@database/Guilds"
import { iOnMessage } from "@interfaces/Command"


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
        case "enable":  return message.reply(ToggleSocialCredit(message.member, message.guild.id, true))
        case "disable": return message.reply(ToggleSocialCredit(message.member, message.guild.id, false))
    }
}

export const name: string = "socialcreditsystem"

export const commandData: ApplicationCommandData = {
    name: "social credit system toggle",
    description: "Show your social credit.",
    options: [{
        name: "State",
        description: "Enable or disable.",
        type: "BOOLEAN",
        required: true
    }],
    type: "CHAT_INPUT",
    defaultPermission: true
}

export const requiredPermissions: PermissionString[] = ["ADMINISTRATOR"]