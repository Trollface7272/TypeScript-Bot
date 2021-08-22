import { model, Schema } from "mongoose"
import { Message } from 'discord.js'
import { Bot } from "../client/Client"

export interface Filter {
    name: string,
    match: string,
    type: "regex" | "word",
    bypass_roles: Array<string>
}

export interface Guild {
    id: String,
    name: String,
    messages: number,
    commands: number,
    skeetkey_uses: number,
    prefix: string,
    filter: Array<Filter>,
}

const schema = new Schema<Guild>({
    id: { type: String, required: true },
    name: { type: String, required: true },
    messages: { type: Number, required: true },
    commands: { type: Number, required: true },
    skeetkey_uses: { type: Number, required: true },
    prefix: { type: String, required: true },
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
        filter: []
    })
    await doc.save()
    return doc
}

export const OnMessage = async (client: Bot, message: Message) => {
    const res = await client.database.database.collection("guilds").updateOne({ id: message.guild.id }, { $inc: { messages: 1 } })
    if (res.matchedCount < 1) await CreateGuild(message)
}

export const OnCommand = async (client: Bot, message: Message) => {
    const res = await client.database.database.collection("guilds").updateOne({ id: message.guild.id }, { $inc: { commands: 1 } })
    if (res.matchedCount < 1) await CreateGuild(message)
}

export const SkeetkeyUsed = async (client: Bot, message: Message) => {
    const res = await client.database.database.collection("guilds").updateOne({ id: message.guild.id }, { $inc: { skeetkey_uses: 1 } })
    if (res.matchedCount < 1) await CreateGuild(message)
}

export const AddFilter = async (client: Bot, message: Message, filter: Filter) => {
    await client.database.database.collection("guilds").updateOne({ id: message.guild.id }, { $push: { filter: filter } })
}

export const RemoveFilter = async (client: Bot, message: Message, name: string) => {
    await client.database.database.collection("guilds").updateOne({ id: message.guild.id }, { $pull: { filter: { name: name } } })
}

export const GetFilter = async (client: Bot, message: Message) => {
    return (await client.database.database.collection("guilds").findOne({ id: message.guild.id }) as Guild).filter
}

export const GetPrefix = async (client: Bot, message: Message) => {
    return (await client.database.database.collection("guilds").findOne({ id: message.guild.id }) as Guild).prefix || "!"
}

export const SetPrefix = async (client: Bot, message: Message, prefix: string) => {
    client.database.database.collection("guilds").updateOne({ id: message.guild.id }, {$set: {prefix}})
}