import { iOnSelectMenu } from "@interfaces/Command"
import { SelectMenuInteraction } from "discord.js"

const MenuButtons = {}

export const RegisterSelectMenu = (id: string, callback: iOnSelectMenu) => {
    MenuButtons[id] = callback
    console.log("registered");
    
}

export const onSelectMenu: iOnSelectMenu = async (interaction: SelectMenuInteraction) => {
    const cmd = interaction.customId

    const callback = MenuButtons[cmd]
    
    console.log(callback);
    
    if (callback) callback(interaction)
    else console.log(callback, !!callback);//(interaction.client as Bot).logChannel.send({embeds: [new MessageEmbed().setDescription(`Error - no function for interaction id -> ${cmd}`)]})
}