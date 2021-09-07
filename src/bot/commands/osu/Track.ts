import { Message } from "discord.js"
import { Bot } from "../../client/Client"
import { RunFunction } from "../../../shared/interfaces/Command"
import { HandleError, ParseArgs } from "../../osu/Utils"
import { Profile } from "../../../shared/interfaces/OsuApi"
import { GetProfileCache } from "../../osu/Api/Api"


export const run: RunFunction = async (client: Bot, message: Message, args: string[]) => {
    switch (args.shift()) {
        case "add": return AddToTracking(client, message, args)
        case "clear": return ClearTracking(client, message)
        case "list": return ListTracking(client, message, args)
        default:
            break;
    }
}

const AddToTracking = async (client: Bot, message: Message, args: string[]): Promise<any> => {
    const options = await ParseArgs(client, message, args)
    if (!options.Name)
        return message.channel.send({
            embeds: [client.embed({ description: "Specity username." }, message)]
        })
    let profile: Profile
    try { profile = await GetProfileCache({u:options.Name, m: options.Flags.m})}
    catch (err) { return HandleError(client, message, err, options.Name) }
    client.database.Tracking.AddToTracking(client, message, profile.id, message.channel.id)
}

const ClearTracking = async (client: Bot, message: Message) => {
    client.database.Tracking.ClearTracking(client, message, message.channel.id)
}

const ListTracking = async (client: Bot, message: Message, args: string[]) => {
    const tracked = client.database.Tracking
}

export const name: string = "track"