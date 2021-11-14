import { Message } from "discord.js"

const Buttons = {

}

export const AddButtonData = (id: string, data: any) => {
    Buttons[id] = data
}

export const GetButtonData = (id: string) => {
    return Buttons[id]
}

export const AddMessage = (id: string, message: Message) => {
    Buttons[id].message = message
}

export const AddMessageToButtons = (message: Message) => {
    const [b1, b2] = message.components[0]?.components || [null, null]
    
    if (b1) AddMessage(b1.customId, message)
    if (b2) AddMessage(b2.customId, message)
}