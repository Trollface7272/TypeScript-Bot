import { model, Schema } from "mongoose"
import { Guild as dGuild } from 'discord.js'
import { database } from "./Main"

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

async function CreateGuild (guild: dGuild): Promise<Guild> {
    const doc = new Model({
        id: guild.id,
        name: guild.name,
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

export const OnMessage = async (guild: dGuild): Promise<void> => {
    const res = await GetCollection()?.updateOne({ id: guild.id }, { $inc: { messages: 1 } })
    if (res.matchedCount < 1) await CreateGuild(guild)
}

export const OnCommand = async (guildId: string): Promise<void> => {
    GetCollection()?.updateOne({ id: guildId }, { $inc: { commands: 1 } })
}

export const SkeetkeyUsed = async (guildId: string): Promise<void> => {
    GetCollection()?.updateOne({ id: guildId }, { $inc: { skeetkey_uses: 1 } })
}

export const AddFilter = async (guildId: string, filter: Filter): Promise<void> => {
    GetCollection()?.updateOne({ id: guildId }, { $push: { filter } })
}

export const RemoveFilter = async (guildId: string, name: string): Promise<void> => {
    GetCollection()?.updateOne({ id: guildId }, { $pull: { filter: { name: name } } })
}

export const GetFilter = async (guildId: string): Promise<Array<Filter>> => {
    return (await GetCollection()?.findOne({ id: guildId }) as Guild).filter || []
}

export const GetPrefix = async (guildId: string): Promise<string[]> => {
    const prefix = (await GetCollection()?.findOne({ id: guildId }) as Guild)?.prefix
    return (prefix ? (Array.isArray(prefix) ? prefix : [prefix]) : ["!"])
}

export const SetPrefix = async (guildId: string, prefix: string): Promise<void> => {
    GetCollection()?.updateOne({ id: guildId }, { $set: { prefix: [prefix] } })
}

export const AddPrefix = async (guildId: string, prefix: string) => {
    GetCollection()?.updateOne({ id: guildId }, { $push: { prefix } })
}

export const GetRetardRoles = async (guildId: string): Promise<Array<string>> => {
    return (await GetCollection()?.findOne({ id: guildId }) as Guild).retard_roles || []
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
    return (await GetCollection()?.findOne({id: guildId}))?.social_credit_enabled
}

export const SetSocialCredit = async (guildId: string, enabled: boolean) => {
    (await GetCollection()?.updateOne({id: guildId}, {$set: {social_credit_enabled: enabled}}))
}

const GetCollection = () => database?.collection("guilds")