import { CommandInteraction, GuildMember, Interaction } from "discord.js"
import { Bot, Embed, logger } from "@client/Client"
import { OnCommand } from "@database/Main"
import { Command, iOnSlashCommand } from "@interfaces/Command"

export const run: iOnSlashCommand = async (interaction: Interaction) => {
    if (interaction.isCommand())
        RunCommand(interaction as CommandInteraction)
}

const RunCommand = (interaction: CommandInteraction) => {
    const cmd: string = interaction.commandName
    const command: Command = (interaction.client as Bot).commands.get(cmd)

    if (!command) return
    for (let i = 0; i < command.requiredPermissions.length; i++)
        if (!((interaction.member as GuildMember).permissions.has(command.requiredPermissions[i])))
            return interaction.reply({ embeds: [Embed({ description: "Insufficient permissions." }, interaction.user)] })

    OnCommand(interaction.guild.id, interaction.user.id)
    // eslint-disable-next-line
    command.onInteraction(interaction).catch((reason: any) => {
        interaction.reply({
            embeds: [Embed({
                description: `Unexpected error: ${reason}`
            }, interaction.user)]
        })
        logger.error((reason))
    })
}

export const name = "interactionCreate"