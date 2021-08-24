import { Message, MessageEmbed } from "discord.js"
import { Bot } from "../../client/Client"
import { RunFunction } from "../../interfaces/Command"
import { Profile } from "../../interfaces/OsuApi"
import { GetProfile } from "../../osu/Api/Api"
import { ParseArgs, ModNames, GetFlagUrl, GetProfileLink, GetServer, GetProfileImage, HandleError } from "../../osu/Utils"

export const run: RunFunction = async (client: Bot, message: Message, args: string[]) => {
    const options = await ParseArgs(client, message, args)
    if (!options.Name) return HandleError(client, message, {code: 1}, options.Name)

    let profile: Profile
    try { profile = await GetProfile({ u: options.Name, m: options.Flags.m }) }
    catch (err) { return HandleError(client, message, err, options.Name) }

    let description = `**▸ Official Rank:** #${profile.Rank.Global.Formatted} (${profile.Country}#${profile.Rank.Country.Formatted})\n`
    description += `**▸ Level:** ${profile.Level.Level} (${profile.Level.Progress}%)\n`
    description += `**▸ Total PP:** ${profile.Performance.Formatted}\n`
    description += `**▸ Hit Accuracy:** ${profile.Accuracy.Formatted}%\n`
    description += `**▸ Playcount:** ${profile.Playcount.Formatted}`

    const embed = new MessageEmbed()
        .setAuthor(`${ModNames.Name[options.Flags.m]} Profile for ${profile.Name}`, GetFlagUrl(profile.Country), GetProfileLink(profile.id, options.Flags.m))
        .setDescription(description)
        .setFooter(GetServer())
        .setThumbnail(GetProfileImage(profile.id))
    message.channel.send({ embeds: [embed] })
}

export const name: Array<string> = ["profile", "osu", "mania", "taiko", "ctb"]