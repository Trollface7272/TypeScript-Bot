import { ApplicationCommandData, CommandInteraction, Message, MessageOptions, PermissionString } from "discord.js"
import { Bot } from "@client/Client"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"


function RandString(length: number) {
    let result = ''
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}

const Prntsc = (): MessageOptions => {
    return {content: `https://prnt.sc/${RandString(6)}`}
}

export const onMessage: iOnMessage = async (client: Bot, message: Message) => {
    message.reply(Prntsc())
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    interaction.reply(Prntsc())
}

export const name: string = "prntsc"
export const commandData: ApplicationCommandData = {
    name: "prntsc",
    description: "Get a random screenshot from prnt.sc website.",
    type: "CHAT_INPUT",
    defaultPermission: true
}
export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]