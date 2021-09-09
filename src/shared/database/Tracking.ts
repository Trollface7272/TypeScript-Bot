import { Message } from "discord.js"
import { model, QueryCursor, Schema, UpdateQuery } from "mongoose"
import { Bot } from "../../bot/client/Client"


export interface Tracking {
    id: number
    channels: string[]
}

const schema = new Schema<Tracking>({
    id: { type: Number, required: true },
    channels: { type: Array, required: true }
})


const Model = model<Tracking>("Tracking", schema)

async function CreateTrackedUser (client: Bot, message: Message, id: number, channel: string): Promise<Tracking> {
    let doc = new Model({
        id: id,
        channels: [channel]
    })
    await doc.save()
    return doc
}

export const AddToTracking = async (client: Bot, message: Message, id: number, channel: string): Promise<void> => {
    let data: Tracking = await GetCollection(client)?.findOne({ id: id })
    if (data) GetCollection(client)?.updateOne({ id: id }, {
        $push: { channels: channel }
    })
    else CreateTrackedUser(client, message, id, channel)
}

export const ClearTracking = async (client: Bot, message: Message, channel: string): Promise<void> => {
    GetCollection(client)?.updateMany({}, { $pull: { channels: channel } })
}

export const RemoveFromTracking = (client: Bot, message: Message, id: number, channel: string) => {
    GetCollection(client)?.updateOne({ id: id }, { $pull: { channels: channel } })
}

export const GetTrackedInChannel = async (client: Bot, mesage: Message, channel: string) => {
    let tracked = GetCollection(client)?.find({ channels: { $all: [channel] } })
    let out = []
    tracked.forEach((el: Tracking) => {
        out.push(el)
    })
    return out
}


const GetCollection = (client: Bot) => client?.database?.database?.collection("tracking")