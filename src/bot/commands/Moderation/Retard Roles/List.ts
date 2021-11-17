import { Bot, Embed } from "@client/Client"
import { GetRetardRoles } from "@database/Guilds"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { CommandInteraction, Guild, GuildMember, Message, MessageOptions, PermissionString } from "discord.js"

const List = async (author: GuildMember, guild: Guild): Promise<MessageOptions> => {
    const roles = await GetRetardRoles(guild.id)
    let out = ""
    for (let i = 0; i < roles?.length; i++) {
        const role = guild.roles.cache.get(roles[i]) || await guild.roles.fetch(roles[i])
        out += `${i + 1}. <@&${role.id}>\n`
    }
    return { embeds: [Embed({ description: out, title: "List of retard roles:" }, author.user)], allowedMentions: {roles: []} }
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    interaction.reply(await List(interaction.member as GuildMember, interaction.guild))
}

export const onMessage: iOnMessage = async (client: Bot, message: Message) => {
    return await List(message.member, message.guild)
} 


export const name = "retardroles list"

export const interactionName = "retardroles list"

export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]