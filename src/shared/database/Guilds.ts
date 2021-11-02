import { model, Schema } from "mongoose"
import { Message } from 'discord.js'
import { Bot } from "../../bot/client/Client"

export interface Filter {
    name: string,
    match: string,
    type: "regex" | "word",
    bypass_roles: Array<string>
}

export interface Guild {
    id: string,
    name: string,
    messages: number,
    commands: number,
    skeetkey_uses: number,
    social_credit_enabled: boolean,
    prefix: string[],
    retard_roles: Array<string>,
    filter: Array<Filter>,
}

const schema = new Schema<Guild>({
    id: { type: String, required: true },
    name: { type: String, required: true },
    messages: { type: Number, required: true },
    commands: { type: Number, required: true },
    skeetkey_uses: { type: Number, required: true },
    social_credit_enabled: {type: Boolean, required: true},
    prefix: { type: Array, required: true },
    retard_roles: { type: Array, required: true },
    filter: { type: Array, required: true }
})


const Model = model<Guild>("Guild", schema)

async function CreateGuild (message: Message): Promise<Guild> {
    const doc = new Model({
        id: message.guild.id,
        name: message.guild.name,
        messages: 1,
        commands: 0,
        skeetkey_uses: 0,
        social_credit_enabled: false,
        prefix: ["!"],
        retard_roles: [],
        filter: []
    })
    await doc.save()
    return doc
}

export const OnMessage = async (client: Bot, message: Message): Promise<void> => {
    const res = await GetCollection(client)?.updateOne({ id: message.guild.id }, { $inc: { messages: 1 } })
    if (res.matchedCount < 1) await CreateGuild(message)
}

export const OnCommand = async (client: Bot, message: Message): Promise<void> => {
    GetCollection(client)?.updateOne({ id: message.guild.id }, { $inc: { commands: 1 } })
}

export const SkeetkeyUsed = async (client: Bot, message: Message): Promise<void> => {
    GetCollection(client)?.updateOne({ id: message.guild.id }, { $inc: { skeetkey_uses: 1 } })
}

export const AddFilter = async (client: Bot, message: Message, filter: Filter): Promise<void> => {
    GetCollection(client)?.updateOne({ id: message.guild.id }, { $push: { filter } })
}

export const RemoveFilter = async (client: Bot, message: Message, name: string): Promise<void> => {
    GetCollection(client)?.updateOne({ id: message.guild.id }, { $pull: { filter: { name: name } } })
}

export const GetFilter = async (client: Bot, message: Message): Promise<Array<Filter>> => {
    return (await GetCollection(client)?.findOne({ id: message.guild.id }) as Guild).filter || []
}

export const GetPrefix = async (client: Bot, message: Message): Promise<string[]> => {
    const prefix = (await GetCollection(client)?.findOne({ id: message.guild.id }) as Guild)?.prefix
    return (prefix ? (Array.isArray(prefix) ? prefix : [prefix]) : ["!"])
}

export const SetPrefix = async (client: Bot, message: Message, prefix: string): Promise<void> => {
    GetCollection(client)?.updateOne({ id: message.guild.id }, { $set: { prefix: [prefix] } })
}

export const AddPrefix = async (client: Bot, message: Message, prefix: string) => {
    GetCollection(client)?.updateOne({ id: message.guild.id }, { $push: { prefix } })
}

export const GetRetardRoles = async (client: Bot, message: Message): Promise<Array<string>> => {
    return (await GetCollection(client)?.findOne({ id: message.guild.id }) as Guild).retard_roles || []
}

export const AddRetardRole = async (client: Bot, message: Message, id: string, position: number): Promise<void> => {
    if (position == -1) GetCollection(client)?.updateOne({ id: message.guild.id }, { $push: { retard_roles: { $each: [id] } } })
    else GetCollection(client)?.updateOne({ id: message.guild.id }, { $push: { retard_roles: { $each: [id], $position: position } } })
}

export const ClearRetardRoles = async (client: Bot, message: Message): Promise<void> => {
    GetCollection(client)?.updateOne({ id: message.guild.id }, { $set: { retard_roles: [] } })
}

export const RemoveRetardRoleId = async (client: Bot, message: Message, id: string): Promise<void> => {
    GetCollection(client)?.updateOne({ id: message.guild.id }, { $pull: { retard_roles: id } })
}

export const RemoveRetardRoleIndex = async (client: Bot, message: Message, index: number): Promise<string> => {
    const id = (await GetRetardRoles(client, message))[index - 1]
    GetCollection(client)?.updateOne({ id: message.guild.id }, { $pull: { retard_roles: id } })
    return id
}

export const IsSocialCreditEnabled = async (client: Bot) => {

}

const GetCollection = (client: Bot) => client?.database?.database?.collection("guilds")