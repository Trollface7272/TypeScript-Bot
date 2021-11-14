import { ApplicationCommandData } from "discord.js";



const SetPrefix: ApplicationCommandData = {
    name: "setprefix",
    description: "Change the default bot prefix on this server.",
    options: [{
        name: "prefix",
        description: "The prefix to change to",
        required: true,
        type: "STRING"
    }],
    type: "CHAT_INPUT",
    defaultPermission: true
}

const Customization: ApplicationCommandData[] = [SetPrefix]


export default Customization