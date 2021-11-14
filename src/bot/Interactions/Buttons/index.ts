import { Bot } from "@bot/client/Client"
import { iOnButton } from "@interfaces/Command"
import { ButtonInteraction, MessageEmbed } from "discord.js"

const RegisteredButtons = {}

export const RegisterButton = (id: string, callback: Function) => {
    RegisteredButtons[id] = callback
}

export const onButton: iOnButton = async (interaction: ButtonInteraction) => {
    const cmd = interaction.customId

    const button = RegisteredButtons[cmd]
    
    
    if (button) button(interaction)
    else console.log(button, !!button);//(interaction.client as Bot).logChannel.send({embeds: [new MessageEmbed().setDescription(`Error - no function for interaction id -> ${cmd}`)]})
}