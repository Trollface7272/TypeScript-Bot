import { model, Schema, UpdateQuery } from "mongoose"
import { Message } from 'discord.js'
import { Bot } from "../client/Client"

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
    prefix: string,
    retard_roles: Array<string>,
    filter: Array<Filter>,
}

const schema = new Schema<Guild>({
    id: { type: String, required: true },
    name: { type: String, required: true },
    messages: { type: Number, required: true },
    commands: { type: Number, required: true },
    skeetkey_uses: { type: Number, required: true },
    prefix: { type: String, required: true },
    retard_roles: {type: Array, required: true},
    filter: { type: Array, required: true }
})


const Model = model<Guild>("Guild", schema)

async function CreateGuild(message: Message): Promise<Guild> {
    let doc = new Model({
        id: message.guild.id,
        name: message.guild.name,
        messages: 1,
        commands: 0,
        skeetkey_uses: 0,
        prefix: "!",
        retard_roles: [],
        filter: []
    })
    await doc.save()
    return doc
}

export const OnMessage = async (client: Bot, message: Message): Promise<void> => {
    const res = await client.database.database.collection("guilds").updateOne({ id: message.guild.id }, { $inc: { messages: 1 } })
    if (res.matchedCount < 1) await CreateGuild(message)
}

export const OnCommand = async (client: Bot, message: Message): Promise<void> => {
    client.database.database.collection("guilds").updateOne({ id: message.guild.id }, { $inc: { commands: 1 } })
}

export const SkeetkeyUsed = async (client: Bot, message: Message): Promise<void> => {
    client.database.database.collection("guilds").updateOne({ id: message.guild.id }, { $inc: { skeetkey_uses: 1 } })
}

export const AddFilter = async (client: Bot, message: Message, filter: Filter): Promise<void> => {
    client.database.database.collection("guilds").updateOne({ id: message.guild.id }, { $push: { filter: filter } })
}

export const RemoveFilter = async (client: Bot, message: Message, name: string): Promise<void> => {
    client.database.database.collection("guilds").updateOne({ id: message.guild.id }, { $pull: { filter: { name: name } } })
}

export const GetFilter = async (client: Bot, message: Message): Promise<Array<Filter>> => {
    return (await client.database.database.collection("guilds").findOne({ id: message.guild.id }) as Guild).filter
}

export const GetPrefix = async (client: Bot, message: Message): Promise<string> => {
    return (await client.database.database.collection("guilds").findOne({ id: message.guild.id }) as Guild)?.prefix || "!"
}

export const SetPrefix = async (client: Bot, message: Message, prefix: string): Promise<void> => {
    client.database.database.collection("guilds").updateOne({ id: message.guild.id }, {$set: {prefix}})
}

export const GetRetardRoles = async (client: Bot, message: Message): Promise<Array<string>> => {
    return (await client.database.database.collection("guilds").findOne({ id: message.guild.id }) as Guild).retard_roles
}

export const AddRetardRole = async (client: Bot, message: Message, id: string, position: number): Promise<void> => {
    let query: UpdateQuery<any>
    if (position == -1) query = {$push: {retard_roles: {$each: [id]}}}
    else query = {$push: {retard_roles: {$each: [id], $position: position}}}
    client.database.database.collection("guilds").updateOne({ id: message.guild.id }, query)
}

export const ClearRetardRoles = async (client: Bot, message: Message): Promise<void> => {
    client.database.database.collection("guilds").updateOne({ id: message.guild.id }, {$set: {retard_roles: []}})
}

export const RemoveRetardRoleId = async (client: Bot, message: Message, id: string): Promise<void> => {
    client.database.database.collection("guilds").updateOne({ id: message.guild.id }, {$pull: {retard_roles: id}})
}

export const RemoveRetardRoleIndex = async (client: Bot, message: Message, index: number): Promise<string> => {
    let id = (await GetRetardRoles(client, message))[index-1]
    client.database.database.collection("guilds").updateOne({ id: message.guild.id }, {$pull: {retard_roles: id}})
    return id
}