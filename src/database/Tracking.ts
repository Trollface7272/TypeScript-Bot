import { Message } from "discord.js"
import { model, Schema } from "mongoose"
import { Bot } from "../bot/client/Client"


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

async function CreateTrackedUser (client: Bot, message: Message, id: number, channel: string, m: 0 | 1 | 2 | 3): Promise<Tracking> {
    const doc = new Model({
        id, m,
        channels: [channel],
        lastcheck: Date.now()
    })
    await doc.save()
    return doc
}

// eslint-disable-next-line
export const AddToTracking = async (client: Bot, message: Message, id: number, channel: string, m: 0 | 1 | 2 | 3): Promise<any> => {
    const search = { id: id, m: m }
    const data: Tracking = await GetCollection(client)?.findOne(search)
    
    if (data) {
        for (const ch of data.channels) if (ch == channel) return message.channel.send({embeds: [client.embed({description: "User already tracked in this channel"}, message)]})
        GetCollection(client)?.updateOne({ id: id, m }, {
            $push: { channels: channel }
        })
    }
    else CreateTrackedUser(client, message, id, channel, m)
}

export const ClearTracking = async (client: Bot, message: Message, channel: string): Promise<void> => {
    GetCollection(client)?.updateMany({}, { $pull: { channels: channel } })
}

export const RemoveFromTracking = (client: Bot, message: Message, id: number, channel: string, m: 0 | 1 | 2 | 3): void => {
    GetCollection(client)?.updateOne({ id: id, m }, { $pull: { channels: channel } })
}

export const GetTrackedInChannel = async (client: Bot, message: Message, channel: string): Promise<TrackedUser[]> => {
    const tracked = await GetCollection(client)?.find({ channels: { $all: [channel] } })?.toArray()
    const out = []
        
    for (const el of tracked) {
        out.push({ id: el.id, m: el.m })
    }
    
    return out
}


const GetCollection = (client: Bot) => client?.database?.database?.collection("trackings")