import { model, Schema } from "mongoose"
import consola, { Consola } from "consola"
import { Message } from 'discord.js'
import { Bot } from "../../bot/client/Client"

interface User {
    id: String,
    name: String,
    messages: number,
    commands: number,
    osu_name: String,
    skeetkey_uses: number
}

const schema = new Schema<User>({
    id: { type: String, required: true },
    name: { type: String, required: true },
    messages: { type: Number, required: true },
    commands: { type: Number, required: true },
    skeetkey_uses: {type: Number, required: true},
    osu_name: String
})

const logger: Consola = consola

const Model = model<User>("User", schema)

async function CreateUser(message: Message): Promise<User> {
    let doc = new Model({
        id: message.author.id,
        name: message.author.tag,
        messages: 1,
        commands: 0,
        skeetkey_uses: 0
    })
    await doc.save()
    return doc
}

export const OnMessage = async (discordClient: Bot, message: Message) => {
    const res = await discordClient.database.database.collection("users").updateOne({id: message.author.id}, {$inc: {messages: 1}})
    if (res.matchedCount < 1) await CreateUser(message)
}

export const OnCommand = async (discordClient: Bot, message: Message) => {
    const res = await discordClient.database.database.collection("users").updateOne({id: message.author.id}, {$inc: {commands: 1}})
    if (res.matchedCount < 1) await CreateUser(message)
}

export const SkeetkeyUsed = async (discordClient: Bot, message: Message) => {
    const res = await discordClient.database.database.collection("users").updateOne({id: message.author.id}, {$inc: {skeetkey_uses: 1}})
    if (res.matchedCount < 1) await CreateUser(message)
}

export const GetOsuUsername = async (discordClient: Bot, message: Message): Promise<String|false> => {
    if (!discordClient.database.database) return false
    return (await discordClient.database.database.collection("users").findOne({id: message.author.id}) as User).osu_name || false
}

export const SetOsuUsername = async (discordClient: Bot, message: Message, name: string): Promise<void> => {
    discordClient.database.database.collection("users").updateOne({id: message.author.id}, {$set: {osu_name: name}})
}