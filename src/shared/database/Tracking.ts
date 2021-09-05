import { Message } from "discord.js"
import { model, Schema, UpdateQuery } from "mongoose"
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

async function CreateTrackedUser(client: Bot, message: Message, id: number, channel: string): Promise<Tracking> {
    let doc = new Model({
        id: id,
        channels: [channel]
    })
    await doc.save()
    return doc
}

export const AddToTracking = async (client: Bot, message: Message, id: number, channel: string) => {
    let data = await client.database.database.collection("tracking").findOne({id: id})
}