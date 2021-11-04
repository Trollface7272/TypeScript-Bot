import { EmbedField, Message } from "discord.js"
import { Bot } from "../../client/Client"
import { RunFunction } from "../../../interfaces/Command"
import { HandleError, ParseArgs } from "../../../lib/osu/Utils"
import { Profile } from "../../../interfaces/OsuApi"
import { GetProfileCache } from "../../../lib/osu/Api/Api"


export const run: RunFunction = async (client: Bot, message: Message, args: string[]) => {
    switch (args.shift()) {
        case "add": return AddToTracking(client, message, args)
        case "clear": return ClearTracking(client, message)
        case "list": return ListTracking(client, message)
        default:
            break;
    }
}

// eslint-disable-next-line
const AddToTracking = async (client: Bot, message: Message, args: string[]): Promise<any> => {
    const options = await ParseArgs(client, message, args)
    if (!options.Name) return HandleError(client, message, {code: 1}, options.Name)

    let profile: Profile
    try { profile = await GetProfileCache({u:options.Name, m: options.Flags.m})}
    catch (err) { return HandleError(client, message, err, options.Name) }
    client.database.Tracking.AddToTracking(client, message, profile.id, message.channel.id, options.Flags.m)
}

const ClearTracking = async (client: Bot, message: Message) => {
    client.database.Tracking.ClearTracking(client, message, message.channel.id)
}

const ListTracking = async (client: Bot, message: Message) => {
    const tracked = await client.database.Tracking.GetTrackedInChannel(client, message, message.channel.id)
    const fields: EmbedField[] = []

    for (let i = 0; i < tracked.length; i++) {
        const e = tracked[i];
        const profile = await GetProfileCache({u: e.id, m: e.m})
        fields.push({
            name: profile.Name,
            value: "\u200b",
            inline: true
        })
    }
    message.channel.send({embeds: [client.embed({
        title: `Active tracked users in ${message.guild.name}:`,
        fields: fields
    }, message)]})
}

export const name: string[] = ["track", "tracking"]