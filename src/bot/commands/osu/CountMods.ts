import { CommandInteraction, GuildMember, Message, MessageEmbed, MessageOptions, PermissionString } from "discord.js"
import { Bot } from "@client/Client"
import { Args, ConvertBitMods, ErrorIds, GetFlagUrl, GetProfileImage, GetProfileLink, GetServer, HandleError, ModNames, ParseArgs } from "@lib/osu/Utils"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { Profile, Score } from "@interfaces/OsuApi"
import { GetProfileCache, GetTop } from "@lib/osu/Api/Api"
import { GetOsuUsername } from "@database/Users"

const osuCountMods = async (author: GuildMember, {Name, Flags: {m}}: Args): Promise<MessageOptions> => {
    if (!Name) return HandleError(author, { code: ErrorIds.NoUsername }, "")

    let profile: Profile
    try { profile = await GetProfileCache({ u: Name, m: m }) }
    catch (err) { return HandleError(author, err, Name) }

    let scores: Array<Score>
    try { scores = await GetTop({ u: Name, m: m, limit: 100 }) }
    catch (err) { HandleError(author, err, profile.Name) }

    const outObj = {}
    for (let i = 0; i < scores.length; i++)
        outObj[scores[i].Mods] = outObj[scores[i].Mods] ? outObj[scores[i].Mods] + 1 : 1

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

