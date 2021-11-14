import { Bot } from "@bot/client/Client"
import { iOnButton } from "@interfaces/Command"
import { ButtonInteraction, MessageEmbed } from "discord.js"

const RegisteredButtons = []

export const RegisterButton = (id: string, callback: Function) => {
    RegisteredButtons.push({id,callback})
}

export const onButton: iOnButton = async (interaction: ButtonInteraction) => {
    const cmd = interaction.customId

    const button = RegisteredButtons.find(el => el.id === cmd)
    if (button) button.callback(interaction)
    else (interaction.client as Bot).logChannel.send({embeds: [new MessageEmbed().setDescription(`Error - no function for interaction id -> ${cmd}`)]})
}