import { GuildMember, MessageOptions } from "discord.js"
import { model, Schema } from "mongoose"
import { Embed } from "@client/Client"
import { database } from "./Main"


export interface Tracking {
    id: number
    m: number
    channels: string[]
    lastcheck: number
}

export interface TrackedUser {
    id: string
    m: 0 | 1 | 2 | 3
}

const schema = new Schema<Tracking>({
    id: { type: Number, required: true },
    m: { type: Number, required: true },
    channels: { type: Array, required: true },
    lastcheck: { type: Number, required: false }
})


const Model = model<Tracking>("Tracking", schema)

async function CreateTrackedUser (id: number, channel: string, m: 0 | 1 | 2 | 3): Promise<Tracking> {
    const doc = new Model({
        id, m,
        channels: [channel],
        lastcheck: Date.now()
    })
    await doc.save()
    return doc
}

// eslint-disable-next-line
export const AddToTracking = async (id: number, channel: string, m: 0 | 1 | 2 | 3, author: GuildMember): Promise<MessageOptions> => {
    const search = { id: id, m: m }
    const data: Tracking = await GetCollection()?.findOne(search)
    
    if (data) {
        for (const ch of data.channels) if (ch == channel) return ({embeds: [Embed({description: "User already tracked in this channel"}, author.user)]})
        GetCollection()?.updateOne({ id: id, m }, {
            $push: { channels: channel }
        })
    }
    else CreateTrackedUser(id, channel, m)
    return {}
}

export const ClearTracking = async (channel: string): Promise<void> => {
    GetCollection()?.updateMany({}, { $pull: { channels: channel } })
}

export const RemoveFromTracking = (id: number, channel: string, m: 0 | 1 | 2 | 3): void => {
    GetCollection()?.updateOne({ id: id, m }, { $pull: { channels: channel } })
}

export const GetTrackedInChannel = async (channel: string): Promise<TrackedUser[]> => {
    const tracked = await GetCollection()?.find({ channels: { $all: [channel] } })?.toArray()
    const out = []
        
    for (const el of tracked) {
        out.push({ id: el.id, m: el.m })
    }
    
    return out
}


const GetCollection = () => database?.collection("trackings")