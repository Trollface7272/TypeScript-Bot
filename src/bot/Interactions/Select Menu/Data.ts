import { Message } from "discord.js"

const Dropdowns = {

}

export const AddDropdownData = (id: string, data: unknown) => {
    Dropdowns[id] = data
}

export const GetDropdownData = (id: string) => {
    return Dropdowns[id]
}

export const AddMessage = (id: string, message: Message) => {
    Dropdowns[id].message = message
}

export const AddMessageToDropdown = (message: Message) => {
    const [d1] = message.components[0]?.components || [null, null]
    
    if (d1) AddMessage(d1.customId, message)
}