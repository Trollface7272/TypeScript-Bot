import { Bot } from "@bot/client/Client"
import { ParseArgs } from "@lib/osu/Utils"
import { Message, PermissionString } from "discord.js"
import { AddToTracking } from "./Add"
import { ClearTracking } from "./Clear"
import { ListTracking } from "./List"



export const onMessage = async (client: Bot, message: Message, args: string[]) => {
    switch(args.shift()) {
        case "add": return await AddToTracking(message.member, await ParseArgs(message, args), message.channel.id)
        case "clear": return await ClearTracking(message.channel.id)
        case "remove": return
        case "list": return await ListTracking(message.member, message.guild, message.channel.id)
    }
}


export const name: string[] = ["track", "tracking"]

export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]