import { BrokenInteraction } from "@lib/Constants"
import { ApplicationCommandData } from "discord.js"

const Troll: ApplicationCommandData[] = [{
    name: "skeet",
    description: BrokenInteraction,
    type: 1,
    defaultPermission: true,
    options: [{
        type: "SUB_COMMAND",
        name: "invite",
        description: "Get skeet invite novirus."
    }],
}, {
    name: "neverlose",
    description: "Get neverlose sub halal 100.",
    options: [{
        name: "username",
        description: "Your username.",
        type: "STRING",
        required: true
    }],
    type: "CHAT_INPUT",
    defaultPermission: true
}]

export default Troll