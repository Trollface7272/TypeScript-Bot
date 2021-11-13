import { ApplicationCommandData, CommandInteraction, Guild, GuildMember, Message, MessageOptions, PermissionString } from "discord.js"
import { Bot } from "@client/Client"
import { iOnMessage, iOnSlashCommand } from "@interfaces/Command"
import { SkeetkeyUsed } from "@database/Main"


const trollNeverlose = (author: GuildMember, guild: Guild, username: string): MessageOptions => {
    seed = 0
    username.split("").forEach(el => seed += el.charCodeAt(0))
    const link = `https://neverlose.cc/activate?code=${RandString(20)}`
    SkeetkeyUsed(guild.id, author.user.id)
    return { content: link }
}

function RandString(length: number) {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(random() * charactersLength))
    }
    return result
}
let seed = 1
function random() {
    const x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
}

export const onMessage: iOnMessage = async (client: Bot, message: Message, args: string[]) => {
    if (args.length < 1) {
        return {
            embeds: [client.embed({
                description: `Please provide your neverlose username.`
            }, message)]
        }

    }
    return trollNeverlose(message.member, message.guild, args.join(""))
}

export const onInteraction: iOnSlashCommand = async (interaction: CommandInteraction) => {
    const username = interaction.options.getString("username")
    interaction.reply(trollNeverlose(interaction.member as GuildMember, interaction.guild, username))
}


export const name = "neverlose"

export const interactionName = "neverlose"

export const requiredPermissions: PermissionString[] = ["SEND_MESSAGES"]