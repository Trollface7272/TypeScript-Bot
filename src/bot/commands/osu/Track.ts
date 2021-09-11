import { Message } from "discord.js"
import { Bot } from "../../client/Client"
import { RunFunction } from "../../../shared/interfaces/Command"
import { HandleError, ParseArgs } from "../../../lib/osu/Utils"
import { Profile } from "../../../shared/interfaces/OsuApi"
import { GetProfileCache } from "../../../lib/osu/Api/Api"
import { Tracking } from "../../../shared/database/Tracking"


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
    client.database.Tracking.AddToTracking(client, message, profile.id, message.channel.id, options.Flags.m)
}

const ClearTracking = async (client: Bot, message: Message) => {
    client.database.Tracking.ClearTracking(client, message, message.channel.id)
}

const ListTracking = async (client: Bot, message: Message, args: string[]) => {
    const tracked = await client.database.Tracking.GetTrackedInChannel(client, message, message.channel.id)
    const fields = []

    for (let i = 0; i < tracked.length; i++) {
        const e = tracked[i];
        let profile = await GetProfileCache({u: e.id, m: e.m})
        fields.push({
            name: profile.id,
            inline: true
        })
    }
    message.channel.send({embeds: [client.embed({
        title: `Active tracked users in ${message.guild.name}:`,
        fields: fields
    }, message)]})
}

export const name: string = "track"