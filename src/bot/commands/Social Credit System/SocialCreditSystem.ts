import { Message } from "discord.js";
import { Bot } from "../../client/Client";
import { RunFunction } from "../../../interfaces/Command";
import { SetSocialCredit } from "../../../database/Guilds";


export const run: RunFunction = async (client: Bot, message: Message, args: string[]) => {
    switch(args[0]) {
        case "enable":  return ToggleSocialCredit(client, message, true)
        case "disable": return ToggleSocialCredit(client, message, false)
    }
}

const ToggleSocialCredit = (client: Bot, message: Message, enable: boolean) => {
    SetSocialCredit(client, message, enable)
    message.reply({
        embeds: [
            client.embed({
                description: `Successfully ${enable ? "enabled" : "disabled"} social credit system.`
            }, message)
        ]
    })
}

export const name: string = "socialcreditsystem"