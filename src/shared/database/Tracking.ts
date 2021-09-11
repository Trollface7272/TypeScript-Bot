import { Message } from "discord.js"
import { model, QueryCursor, Schema, UpdateQuery } from "mongoose"
import { Bot } from "../../bot/client/Client"


export interface Tracking {
    id: number
    m: number
    channels: string[]
}

export interface TrackedUser {
    id: string
    m: 0 | 1 | 2 | 3
}

const schema = new Schema<Tracking>({
    id: { type: Number, required: true },
    m: { type: Number, required: true },
    channels: { type: Array, required: true }
})


const Model = model<Tracking>("Tracking", schema)

async function CreateTrackedUser (client: Bot, message: Message, id: number, channel: string, m: 0 | 1 | 2 | 3): Promise<Tracking> {
    let doc = new Model({
        id: id,
        m,
        channels: [channel]
    })
    await doc.save()
    return doc
}

export const AddToTracking = async (client: Bot, message: Message, id: number, channel: string, m: 0 | 1 | 2 | 3): Promise<void> => {
    let data: Tracking = await GetCollection(client)?.findOne({ id: id, m })
    if (data) GetCollection(client)?.updateOne({ id: id, m }, {
        $push: { channels: channel }
    })
    else CreateTrackedUser(client, message, id, channel, m)
}

export const ClearTracking = async (client: Bot, message: Message, channel: string): Promise<void> => {
    GetCollection(client)?.updateMany({}, { $pull: { channels: channel } })
}

export const RemoveFromTracking = (client: Bot, message: Message, id: number, channel: string, m: 0 | 1 | 2 | 3): void => {
    GetCollection(client)?.updateOne({ id: id, m }, { $pull: { channels: channel } })
}

export const GetTrackedInChannel = async (client: Bot, mesage: Message, channel: string): Promise<TrackedUser[]> => {
    let tracked = GetCollection(client)?.find({ channels: { $all: [channel] } })
    let out = []
    tracked.forEach((el: Tracking) => {
        out.push({ id: el.id, m: el.m })
    })
    return out
}


const GetCollection = (client: Bot) => client?.database?.database?.collection("tracking")