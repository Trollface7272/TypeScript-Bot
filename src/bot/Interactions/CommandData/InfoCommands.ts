import { BrokenInteraction, CommanOptions } from "@lib/Constants"
import { ApplicationCommandData } from "discord.js"

const { TargetUser } = CommanOptions.Misc

const Avatar: ApplicationCommandData = {
    name: "avatar",
    description: "Get url of someones avatar.",
    options: [TargetUser],
    type: "CHAT_INPUT",
    defaultPermission: true
}

const EmojiLink: ApplicationCommandData = {
    name: "emoji",
    description: BrokenInteraction,
    options: [{
        name: "link",
        description: "Get url of emoji.",
        type: "SUB_COMMAND",
        options: [{
            name: "emoji",
            description: "Target Emoji.",
            type: "STRING",
            required: false
        }]
    }],
    type: "CHAT_INPUT",
    defaultPermission: true
}

const Invite: ApplicationCommandData = {
    name: "invite",
    description: "Get bot invite.",
    type: "CHAT_INPUT",
    defaultPermission: true
}

const Ping: ApplicationCommandData = {
    name: "ping",
    description: "Check bots ping to discord servers.",
    type: "CHAT_INPUT",
    defaultPermission: true
}

const InfoCommands: ApplicationCommandData[] = [Avatar, EmojiLink, Invite, Ping]



export default InfoCommands