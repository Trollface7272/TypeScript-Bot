import { ApplicationCommandData, CommandInteraction, GuildMember, Message, MessageOptions, PermissionString } from "discord.js"
import { Bot } from "@client/Client"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { Profile } from "@interfaces/OsuApi"
import { GetProfileCache } from "@lib/osu/Api/Api"
import { Args, HandleError, ParseArgs } from "@lib/osu/Utils"
import { AddToTracking as dAddToTracking } from "@database/Tracking"
import { osuGamemodeOption, osuUsernameOption } from "@lib/Constants"
import { GetOsuUsername } from "@database/Users"

const AddToTracking = async (author: GuildMember, options: Args, channelId: string): Promise<MessageOptions> => {
    if (!options.Name) return HandleError(author, {code: 1}, options.Name)

    let profile: Profile
    try { profile = await GetProfileCache({u:options.Name, m: options.Flags.m})}
    catch (err) { return HandleError(author, err, options.Name) }
    dAddToTracking(profile.id, channelId, options.Flags.m, author)
}



export const onMessage: iOnMessage = async (client: Bot, message: Message, args: string[]) => {
    return message.reply(await AddToTracking(message.member, await ParseArgs(message, args), message.channel.id))
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    let username = interaction.options.getString("username") || await GetOsuUsername(interaction.user.id)
    if (!username) interaction.reply(HandleError(interaction.member as GuildMember, { code: 1 }, ""))
    let options: Args = {
        Name: username as string,
        Flags: {
            m: interaction.options.getNumber("mode") as 0 | 1 | 2 | 3
        }
    }
    return interaction.reply(await AddToTracking(interaction.member as GuildMember, options, interaction.channel.id))
}

export const name: string[] = ["track add", "tracking add"]
export const commandData: ApplicationCommandData = {
    name: "osu track add",
    description: "Add user to tracking.",
    options: [osuUsernameOption, osuGamemodeOption],
    type: "CHAT_INPUT",
    defaultPermission: true
}
export const requiredPermissions: PermissionString[] = ["MANAGE_CHANNELS"]