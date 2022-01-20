/* eslint-disable prefer-const */
import { CommandInteraction, GuildMember, Message, MessageOptions, PermissionString } from "discord.js"
import { Bot } from "@client/Client"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { Args, HandleError, ParseArgs } from "@lib/osu/Utils"
import { AddToTracking as dAddToTracking } from "@database/Tracking"
import { GetOsuUsername } from "@database/Users"
import { OsuProfile } from "@lib/osu/lib/Endpoints/Profile"
import { HandleAwait } from "@lib/GlobalUtils"

export const AddToTracking = async (author: GuildMember, options: Args, channelId: string): Promise<MessageOptions> => {
    if (!options.Name) return HandleError(author, {code: 1}, options.Name)
    let profile: OsuProfile, err: { code: number }
    ;[profile, err] = await HandleAwait(new OsuProfile().Load({u:options.Name, m: options.Flags.m, useCache: true}))
    if (err)  return HandleError(author, err, options.Name)

    dAddToTracking(profile.id, profile.Name, channelId, options.Flags.m, author)
}



export const onMessage: iOnMessage = async (client: Bot, message: Message, args: string[]) => {
    return await AddToTracking(message.member, await ParseArgs(message, args), message.channel.id)
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    const username = interaction.options.getString("username") || await GetOsuUsername(interaction.user.id)
    if (!username) interaction.reply(HandleError(interaction.member as GuildMember, { code: 1 }, ""))
    const options: Args = {
        Name: username as string,
        Flags: {
            m: (interaction.options.getInteger("mode") as 0 | 1 | 2 | 3) || 0
        }
    }
    return interaction.reply(await AddToTracking(interaction.member as GuildMember, options, interaction.channel.id))
}

export const name: string[] = []

export const interactionName = "osu track add"

export const requiredPermissions: PermissionString[] = ["MANAGE_CHANNELS"]