import { model, Schema } from "mongoose"
import { Message } from 'discord.js'
import { Bot } from "../bot/client/Client"

interface User {
    id: string,
    name: string,
    social_credit: number,
    messages: number,
    commands: number,
    osu_name: string,
    skeetkey_uses: number
}

const schema = new Schema<User>({
    id: { type: String, required: true },
    name: { type: String, required: true },
    social_credit: {type: Number, required: true },
    messages: { type: Number, required: true },
    commands: { type: Number, required: true },
    skeetkey_uses: {type: Number, required: true},
    osu_name: String
})

const Model = model<User>("User", schema)

async function CreateUser(message: Message): Promise<User> {
    const doc = new Model({
        id: message.author.id,
        name: message.author.tag,
        messages: 1,
        social_credit: 1000,
        commands: 0,
        skeetkey_uses: 0
    })
    await doc.save()
    return doc
}

export const OnMessage = async (client: Bot, message: Message) => {
    const res = await GetCollection(client)?.updateOne({id: message.author.id}, {$inc: {messages: 1}})
    if (res.matchedCount < 1) await CreateUser(message)
}

export const OnCommand = async (client: Bot, message: Message) => {
    const res = await GetCollection(client)?.updateOne({id: message.author.id}, {$inc: {commands: 1}})
    if (res.matchedCount < 1) await CreateUser(message)
}

export const SkeetkeyUsed = async (client: Bot, message: Message) => {
    const res = await GetCollection(client)?.updateOne({id: message.author.id}, {$inc: {skeetkey_uses: 1}})
    if (res.matchedCount < 1) await CreateUser(message)
}

export const GetOsuUsername = async (client: Bot, message: Message): Promise<string|false> => {
    return (await GetCollection(client)?.findOne({id: message.author.id}) as User).osu_name || false
}

export const SetOsuUsername = (client: Bot, message: Message, name: string): void => {
    GetCollection(client)?.updateOne({id: message.author.id}, {$set: {osu_name: name}})
}

export const AddSocialCredit = (client: Bot, message: Message, amount: number): void => {
    GetCollection(client)?.updateOne({id: message.author.id}, {$inc: { social_credit: amount }})
}

export const SetSocialCredit = (client: Bot, message: Message, amount: number): void => {
    GetCollection(client)?.updateOne({id: message.author.id}, {$set: { social_credit: amount }})
}

export const GetSocialCredit = async (client: Bot, message: Message): Promise<number> => {
    return (await GetCollection(client)?.findOne({id: message.author.id})).social_credit || 1000
}


const GetCollection = (client: Bot) => client?.database?.database?.collection("users")
