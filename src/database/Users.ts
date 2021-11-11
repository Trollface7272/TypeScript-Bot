import { model, Schema } from "mongoose"
import { GuildMember } from 'discord.js'
import { database } from "./Main"

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

async function CreateUser(author: GuildMember): Promise<User> {
    const doc = new Model({
        id: author.user.id,
        name: author.user.tag,
        messages: 1,
        social_credit: 1000,
        commands: 0,
        skeetkey_uses: 0
    })
    await doc.save()
    return doc
}

export const OnMessage = async (author: GuildMember) => {
    const res = await GetCollection()?.updateOne({id: author.user.id}, {$inc: {messages: 1}})
    if (res.matchedCount < 1) await CreateUser(author)
}

export const OnCommand = async (userId: string) => {
    await GetCollection()?.updateOne({id: userId}, {$inc: {commands: 1}})
}

export const SkeetkeyUsed = async (userId: string) => {
    await GetCollection()?.updateOne({id: userId}, {$inc: {skeetkey_uses: 1}})
}

export const GetOsuUsername = async (userId: string): Promise<string|false> => {
    return (await GetCollection()?.findOne({id: userId}) as User).osu_name || false
}

export const SetOsuUsername = (userId: string, name: string): void => {
    GetCollection()?.updateOne({id: userId}, {$set: {osu_name: name}})
}

export const AddSocialCredit = (userId: string, amount: number): void => {
    GetCollection()?.updateOne({id: userId}, {$inc: { social_credit: amount }})
}

export const SetSocialCredit = (userId: string, amount: number): void => {
    GetCollection()?.updateOne({id: userId}, {$set: { social_credit: amount }})
}

export const GetSocialCredit = async (userId: string): Promise<number> => {
    return (await GetCollection()?.findOne({id: userId})).social_credit || 1000
}


const GetCollection = () => database?.collection("users")
