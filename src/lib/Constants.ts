import { ApplicationCommandChoicesData, ApplicationCommandNonOptionsData, MessageSelectOption, MessageSelectOptionData, TextChannel } from "discord.js"
import { join } from "path"

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

const osuUsername: ApplicationCommandChoicesData = {
    name: "username",
    description: "Username.",
    type: "STRING",
    required: false,
}

const osuGamemode: ApplicationCommandChoicesData = {
    name: "mode",
    description: "Gamemode.",
    type: "INTEGER",
    required: false,
    choices: InteractionOsuGamemodeChoices
}

const osuMapId: ApplicationCommandChoicesData = {
    name: "map_id",
    description: "Id of the map.",
    type: "INTEGER",
    required: false,
}

const osuMapLink: ApplicationCommandChoicesData = {
    name: "map_link",
    description: "Link to the map.",
    type: "STRING",
    required: false,
}

const osuMods: ApplicationCommandChoicesData = {
    name: "mods",
    description: "Mods in 2 letter per mod format.",
    type: "STRING",
    required: false
}

const osuModsRaw: ApplicationCommandChoicesData = {
    name: "mods_raw",
    description: "Mods as number.",
    type: "INTEGER",
    required: false
}

const osuList: ApplicationCommandNonOptionsData = {
    name: "list",
    description: "List of 5 recent plays.",
    type: "BOOLEAN",
    required: false
}
const osuBest: ApplicationCommandNonOptionsData = {
    name: "best",
    description: "Newest top play.",
    type: "BOOLEAN",
    required: false
}
const osuGreaterThan: ApplicationCommandChoicesData = {
    name: "greater_than",
    description: "Only with Best enabled, newest top play above selected number.",
    type: "NUMBER",
    required: false
}
const osuReversed: ApplicationCommandNonOptionsData = {
    name: "reversed",
    description: "Only with Best enabled, reverse selection.",
    type: "BOOLEAN",
    required: false
}
const osuSpecific: ApplicationCommandChoicesData = {
    name: "specific",
    description: "Which top play (1-100).",
    type: "INTEGER",
    required: false
}
const osuRandom: ApplicationCommandNonOptionsData = {
    name: "random",
    description: "Random top play",
    type: "BOOLEAN",
    required: false
}

const osu = {
    Gamemode: osuGamemode,
    Username: osuUsername,
    MapId: osuMapId,
    MapLink: osuMapLink,
    Mods: osuMods,
    ModsRaw: osuModsRaw,
    List: osuList,
    Best: osuBest,
    GreaterThan: osuGreaterThan,
    Reversed: osuReversed,
    Specific: osuSpecific,
    Random: osuRandom
}

const TargetUser: ApplicationCommandNonOptionsData = {
    name: "user",
    description: "Target user.",
    type: "USER",
    required: false
}

const Misc = {
    TargetUser: TargetUser
}

export const CommanOptions = {
    osu,
    Misc
}

export const getOsuSelectGamemodes = (m: 0 | 1 | 2 | 3) => {
    return [{
        default: m == 0,
        label: "Standard",
        value: "0"
    }, {
        default: m == 1,
        label: "Taiko",
        value: "1"
    }, {
        default: m == 2,
        label: "Catch the beat",
        value: "2"
    }, {
        default: m == 3,
        label: "Mania",
        value: "3"
    }]
}

export const BrokenInteraction = "This is not a command if you see this something is broken!"

export const cachePath = `${join(__dirname, "..", "cache")}`