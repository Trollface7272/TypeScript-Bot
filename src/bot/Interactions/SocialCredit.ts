import { ApplicationCommandData } from "discord.js"

const SocialCredit: ApplicationCommandData[] = [{
    name: "socialcreditsystem",
    description: "Show your social credit.",
    options: [{
        name: "state",
        description: "Enable or disable.",
        type: "BOOLEAN",
        required: true
    }],
    type: "CHAT_INPUT",
    defaultPermission: true
}, {
    name: "socialcredit",
    description: "Show your social credit.",
    type: "CHAT_INPUT",
    defaultPermission: true
}]

export default SocialCredit