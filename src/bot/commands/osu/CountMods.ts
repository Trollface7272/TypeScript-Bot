/* eslint-disable prefer-const */
import { CommandInteraction, GuildMember, Message, MessageEmbed, MessageOptions, PermissionString } from "discord.js"
import { Bot } from "@client/Client"
import { Args, ConvertBitMods, ErrorIds, GetFlagUrl, GetProfileImage, GetProfileLink, GetServer, HandleError, ModNames, ParseArgs } from "@lib/osu/Utils"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { GetOsuUsername } from "@database/Users"
import { OsuProfile } from "@lib/osu/lib/Endpoints/Profile"
import { OsuScore } from "@lib/osu/lib/Endpoints/Score"
import { HandleAwait } from "@lib/GlobalUtils"

const osuCountMods = async (author: GuildMember, {Name, Flags: {m}}: Args): Promise<MessageOptions> => {
    if (!Name) return HandleError(author, { code: ErrorIds.NoUsername }, "")
    let profile: OsuProfile, err: {code: number}, scores: OsuScore
    
    ;[profile, err] = await HandleAwait(new OsuProfile().Load({ u: Name, m: m, useCache: true }))
    if (err) return HandleError(author, err, profile.Name)

    ;[scores, err] = await HandleAwait(new OsuScore().Top({ u: Name, m: m, limit: 100 }))
    if (err) return HandleError(author, err, profile.Name)

    const outObj = {}
    for (let i = 0; i < scores.Scores.length; i++)
        outObj[scores.Scores[i].Mods] = outObj[scores.Scores[i].Mods] ? outObj[scores.Scores[i].Mods] + 1 : 1

    const outArr = []
    for (const key in outObj)
        outArr.push([parseInt(key), outObj[key]])

    outArr.sort((a: number, b: number) => b[1] - a[1])

    let description = ""
    outArr.forEach(el => {
        description += `**${ConvertBitMods(el[0])}**: ${el[1]}\n`
    })

    const embed = new MessageEmbed()
    .setAuthor(`Mods in ${ModNames.Name[m]} Top Plays for ${profile.Name}`, GetFlagUrl(profile.Country), GetProfileLink(profile.id, m))
        .setDescription(description)
        .setFooter(GetServer())
        .setThumbnail(GetProfileImage(profile.id))
    return ({embeds: [embed]})
}

export const onMessage: iOnMessage = async (client: Bot, message: Message, args: string[]) => {
    const options: Args = await ParseArgs(message, args)

    return await osuCountMods(message.member, options)
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    const username = interaction.options.getString("username") || await GetOsuUsername(interaction.user.id)
    if (!username) interaction.reply(HandleError(interaction.member as GuildMember, { code: 1 }, ""))
    
    const options: Args = {
        Name: username as string,
        Flags: {
            m: (interaction.options.getInteger("mode") as 0 | 1 | 2 | 3) || 0,
            mods: 0
        }
    }

    interaction.reply(await osuCountMods(interaction.member as GuildMember, options))
}

export const name = "countmods"

export const interactionName = "osu countmods"

export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]

