import { ApplicationCommandData } from "discord.js";


const Prntsc: ApplicationCommandData = {
    name: "prntsc",
    description: "Get a random screenshot from prnt.sc website.",
    type: "CHAT_INPUT",
    defaultPermission: true
}

const Fun: ApplicationCommandData[] = [Prntsc]


export default Fun