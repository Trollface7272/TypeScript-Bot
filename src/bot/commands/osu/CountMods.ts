import { Message, MessageEmbed } from "discord.js";
import { Bot } from "../../client/Client";
import { RunFunction } from "../../../shared/interfaces/Command";
import { Profile, Score, ScoreParams } from "../../../shared/interfaces/OsuApi";
import { GetProfileCache, GetTop } from "../../osu/Api/Api";
import { Args, ConvertBitMods, ErrorIds, GetFlagUrl, GetProfileImage, GetProfileLink, GetServer, HandleError, ModNames, ParseArgs } from "../../osu/Utils";


export const run: RunFunction = async (client: Bot, message: Message, args: string[]) => {
    let options: Args = await ParseArgs(client, message, args)

    if (!options.Name) return HandleError(client, message, { code: ErrorIds.NoUsername }, "")

    let profile: Profile
    try { profile = await GetProfileCache({ u: options.Name, m: options.Flags.m }) }
    catch (err) { return HandleError(client, message, err, options.Name) }

    let scores: Array<Score>
    try { scores = await GetTop({ u: options.Name, m: options.Flags.m, limit: 100 }) }
    catch (err) { HandleError(client, message, err, profile.Name) }

    let outObj = {}
    for (let i = 0; i < scores.length; i++)
        outObj[scores[i].Mods] = outObj[scores[i].Mods] ? outObj[scores[i].Mods] + 1 : 1

    let outArr = []
    for (let key in outObj)
        outArr.push([parseInt(key), outObj[key]])

    outArr.sort((a: number, b: number) => b[1] - a[1])

    let description: string = ""
    outArr.forEach(el => {
        description += `**${ConvertBitMods(client, el[0])}**: ${el[1]}\n`
    })

    const embed = new MessageEmbed()
    .setAuthor(`Mods in ${ModNames.Name[options.Flags.m]} Top Plays for ${profile.Name}`, GetFlagUrl(profile.Country), GetProfileLink(profile.id, options.Flags.m))
        .setDescription(description)
        .setFooter(GetServer())
        .setThumbnail(GetProfileImage(profile.id))
    message.channel.send({embeds: [embed]})
}

export const name: string = "countmods"