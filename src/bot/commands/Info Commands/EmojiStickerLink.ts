import { ApplicationCommandData, CommandInteraction, Message, MessageOptions, PermissionString, Sticker as dSticker } from "discord.js"
import { Bot } from "@client/Client"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"


const Sticker = (sticker: dSticker): MessageOptions => {
    return {content: sticker.url}
}

const Emoji = (id: string, animated: boolean): MessageOptions => {
    return {content: `https://cdn.discordapp.com/emojis/${id}.${animated ? "gif" : "png"}?v=1` }
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    const emoji = interaction.options.getString("emoji")
}

export const onMessage: iOnMessage = async (client: Bot, message: Message, args: string[]) => {
    if (message.stickers.size < 1 && args.length < 1) return message.reply({embeds: [client.embed({description: "No emoji/sticker provided"}, message)]})

    if (message.stickers.size > 0)
        return message.reply(Sticker(message.stickers.first()))

    for (let i = 0; i < args.length; i++) {
        const el = args[i]
        if (!el.includes("<:") && !el.includes("<a:")) return
        const arr = el.substr(0, el.length - 1).split(":")
        arr.shift()
        return message.reply(Emoji(arr[1], el.includes("<a:")))
    }

    message.reply({embeds: [client.embed({description: "No emoji/sticker provided"}, message)]})
}

export const name = "link"
export const commandData: ApplicationCommandData = {
    name: "emoji link",
    description: "Get url of emoji.",
    options: [{
        name: "emoji",
        description: "Target Emoji.",
        type: "STRING",
        required: false
    }],
    type: "CHAT_INPUT",
    defaultPermission: true
}
export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]