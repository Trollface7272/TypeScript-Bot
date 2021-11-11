import { ApplicationCommandOptionData } from "discord.js"

const InteractionOsuGamemodeChoices = [{
    name: "standard",
    value: 0
}, {
    name: "taiko",
    value: 1
}, {
    name: "catch",
    value: 2
}, {
    name: "mania",
    value: 3
}]

export const osuUsernameOption: ApplicationCommandOptionData = {
    name: "username",
    description: "Username.",
    type: 3,
    required: false,
}

export const osuGamemodeOption: ApplicationCommandOptionData = {
    name: "mode",
    description: "Gamemode.",
    type: 4,
    required: false,
    choices: InteractionOsuGamemodeChoices
}