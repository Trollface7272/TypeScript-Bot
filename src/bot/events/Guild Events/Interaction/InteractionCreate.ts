import { ButtonInteraction, CommandInteraction, GuildMember, Interaction, MessageEmbed, SelectMenuInteraction } from "discord.js"
import { Bot, Embed, logger } from "@client/Client"
import { OnCommand } from "@database/Main"
import { Command } from "@interfaces/Command"
import { onButton } from "@bot/Interactions/Buttons"
import { onSelectMenu } from "@bot/Interactions/Select Menu/info"

export const run = async (_, interaction: Interaction) => {
    if (interaction.isCommand())
        RunCommand(interaction as CommandInteraction)
    else if (interaction.isButton())
        onButton(interaction as ButtonInteraction)
    else if (interaction.isSelectMenu())
        onSelectMenu(interaction as SelectMenuInteraction)
}

const RunCommand = (interaction: CommandInteraction) => {
    const cmd: string = GetCommandName(interaction)
    
    const command: Command = (interaction.client as Bot).commands.find((e) => e.interactionName == cmd)

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
        ;(interaction.client as Bot).logChannel.send({embeds: [new MessageEmbed().setDescription(`Unexpected error: ${reason}`)]})
        logger.error((reason))
    })
}

const GetCommandName = (interaction: CommandInteraction): string => {
    const cmdName = interaction.commandName
    const subCmdGroup = interaction.options.getSubcommandGroup(false)
    const subCmd = interaction.options.getSubcommand(false)
    return cmdName + (subCmdGroup ? ` ${subCmdGroup}` : "") + (subCmd? ` ${subCmd}` : "")
}

export const name = "interactionCreate"