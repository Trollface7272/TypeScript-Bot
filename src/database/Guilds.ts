import { model, Schema } from "mongoose"
import { Guild as dGuild, GuildMember } from 'discord.js'
import { database } from "./Main"

export interface iFilter {
    name: string,
    match: string,
    type: "regex" | "word",
    bypass_roles: Array<string>
}

export interface iGuildUser {
    id: string
    name: string,
    social_credit: number,
    messages: number
}

export interface iGuild {
    id: string,
    name: string,
    messages: number,
    commands: number,
    skeetkey_uses: number,
    social_credit_enabled: boolean,
    prefix: string[],
    retard_roles: string[],
    filter: iFilter[],
    users: iGuildUser[]
}

const schema = new Schema<iGuild>({
    id: { type: String, required: true },
    name: { type: String, required: true },
    messages: { type: Number, required: true },
    commands: { type: Number, required: true },
    skeetkey_uses: { type: Number, required: true },
    social_credit_enabled: { type: Boolean, required: true },
    prefix: { type: Array, required: true },
    retard_roles: { type: Array, required: true },
    filter: { type: Array, required: true },
    users: { type: Array, required: true }
})

const Model = model<iGuild>("Guild", schema)

async function CreateGuild(guild: dGuild): Promise<iGuild> {
    const doc = new Model({
        id: guild.id,
        name: guild.name,
        messages: 1,
        commands: 0,
        skeetkey_uses: 0,
        social_credit_enabled: false,
        prefix: ["!"],
        retard_roles: [],
        filter: [],
        users: []
    })
    await doc.save()
    return doc
}

const AddGuildUser = async (guildId: string, user: GuildMember) => {
    await GetCollection()?.updateOne({ id: guildId }, {$push: {users: {
        id: user.id,
        name: user.user.username,
        social_credit: 1000,
        messages: 0
    }}})
}

export const OnMessage = async (guild: dGuild, user: GuildMember): Promise<void> => {
    let res = await GetCollection()?.updateOne({ id: guild.id }, { $inc: { messages: 1 } })
    if (res.matchedCount < 1) await CreateGuild(guild)
    res = await GetCollection()?.updateOne({ id: guild.id, "users.id": user.id }, { $inc: { "users.$.messages": 1 } })
    if (res.matchedCount < 1) await AddGuildUser(guild.id, user)
}

export const OnCommand = async (guildId: string): Promise<void> => {
    GetCollection()?.updateOne({ id: guildId }, { $inc: { commands: 1 } })
}

export const SkeetkeyUsed = async (guildId: string): Promise<void> => {
    GetCollection()?.updateOne({ id: guildId }, { $inc: { skeetkey_uses: 1 } })
}

export const AddFilter = async (guildId: string, filter: iFilter): Promise<void> => {
    GetCollection()?.updateOne({ id: guildId }, { $push: { filter } })
}

export const RemoveFilter = async (guildId: string, name: string): Promise<void> => {
    GetCollection()?.updateOne({ id: guildId }, { $pull: { filter: { name: name } } })
}

export const GetFilter = async (guildId: string): Promise<Array<iFilter>> => {
    return (await GetCollection()?.findOne({ id: guildId }) as iGuild).filter || []
}

export const GetPrefix = async (guildId: string): Promise<string[]> => {
    const prefix = (await GetCollection()?.findOne({ id: guildId }) as iGuild)?.prefix
    return (prefix ? (Array.isArray(prefix) ? prefix : [prefix]) : ["!"])
}

export const SetPrefix = async (guildId: string, prefix: string): Promise<void> => {
    GetCollection()?.updateOne({ id: guildId }, { $set: { prefix: [prefix] } })
}

export const AddPrefix = async (guildId: string, prefix: string) => {
    GetCollection()?.updateOne({ id: guildId }, { $push: { prefix } })
}

export const GetRetardRoles = async (guildId: string): Promise<Array<string>> => {
    return (await GetCollection()?.findOne({ id: guildId }) as iGuild).retard_roles || []
}

export const AddRetardRole = async (guildId: string, id: string, position: number): Promise<void> => {
    if (position == -1) GetCollection()?.updateOne({ id: guildId }, { $push: { retard_roles: { $each: [id] } } })
    else GetCollection()?.updateOne({ id: guildId }, { $push: { retard_roles: { $each: [id], $position: position } } })
}

export const ClearRetardRoles = async (guildId: string): Promise<void> => {
    GetCollection()?.updateOne({ id: guildId }, { $set: { retard_roles: [] } })
}

export const RemoveRetardRoleId = async (guildId: string, id: string): Promise<void> => {
    GetCollection()?.updateOne({ id: guildId }, { $pull: { retard_roles: id } })
}

export const RemoveRetardRoleIndex = async (guildId: string, index: number): Promise<string> => {
    const id = (await GetRetardRoles(guildId))[index - 1]
    GetCollection()?.updateOne({ id: guildId }, { $pull: { retard_roles: id } })
    return id
}

export const IsSocialCreditEnabled = async (guildId: string) => {
    return (await GetCollection()?.findOne({ id: guildId }))?.social_credit_enabled
}

export const ToggleSocialCredit = async (guildId: string, enabled: boolean) => {
    (await GetCollection()?.updateOne({ id: guildId }, { $set: { social_credit_enabled: enabled } }))
}

export const AddSocialCredit = (guildId: string, userId: string, amount: number): void => {
    GetCollection()?.updateOne({id: guildId, "users.id": userId}, {$inc: { "users.$.social_credit": amount }})
}

export const SetSocialCredit = (guildId: string, userId: string, amount: number): void => {
    GetCollection()?.updateOne({id: guildId, "users.id": userId}, {$set: { "users.$.social_credit": amount }})
}

export const GetSocialCredit = async (guildId: string, userId: string): Promise<number> => {
    const guild: iGuild = (await GetCollection()?.findOne({id: guildId, "users.id": userId}))    
    return guild.users.find(el => el.id == userId).social_credit
}

const GetCollection = () => database?.collection("guilds")