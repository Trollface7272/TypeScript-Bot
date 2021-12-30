import { Bot } from "@bot/client/Client"
import { iOnMessage } from "@interfaces/Command"
import { Message, PermissionString } from "discord.js"

const Roll = (limit: number) => {
    if (isNaN(limit)) limit = 100
    return Math.round(Math.random() * (limit + 1)).toString()
}

export const onMessage: iOnMessage = async (client: Bot, message: Message, args: string[]) => {
    return Roll(parseInt(args[0]))
}


export const name = "roll"

export const interactionName = "roll"

export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]