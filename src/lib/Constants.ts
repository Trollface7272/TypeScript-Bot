import { ApplicationCommandChoicesData, ApplicationCommandNonOptionsData, MessageSelectOption, MessageSelectOptionData, SelectMenuInteraction, TextChannel } from "discord.js"
import { join } from "path"
import { Mods } from "./osu/Utils"

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

export const getOsuSelectGamemodes = (m: 0 | 1 | 2 | 3): MessageSelectOptionData[] => {
    return [{
        default: m == 0,
        label: "Standard",
        value: "0",
        emoji: "<:Osu:909904224631001129>"
    }, {
        default: m == 1,
        label: "Taiko",
        value: "1",
        emoji: "<:Taiko:909904240858771476>"
    }, {
        default: m == 2,
        label: "Catch the beat",
        value: "2",
        emoji: "<:Fruits:909904199519703110>"
    }, {
        default: m == 3,
        label: "Mania",
        value: "3",
        emoji: "<:Mania:909904211800637450>"
    }]
}

export const getOsuSelectMods = (mods: number): MessageSelectOptionData[] => {
    return [{
        default: (mods & 1) > 0,
        label: "NoFail",
        value: "1",
        emoji: "<:NoFail:586217719632887808>"
    }, {
        default: (mods & 2) > 0,
        label: "Easy",
        value: "2",
        emoji: "<:Easy:586217683188580377>"
    }, {
        default: (mods & 8) > 0,
        label: "Hidden",
        value: "8",
        emoji: "<:Hidden:586217719129440256>"
    }, {
        default: (mods & 16) > 0,
        label: "Hard Rock",
        value: "16",
        emoji: "<:HardRock:586217719125245952>"
    }, {
        default: (mods & 64) > 0,
        label: "Double Time",
        value: "64",
        emoji: "<:DoubleTime:586217676276367361>"
    }, {
        default: (mods & 256) > 0,
        label: "Half Time",
        value: "256",
        emoji: "<:HalfTime:586217719104405504>"
    }, {
        default: (mods & 1024) > 0,
        label: "Flashlight",
        value: "1024",
        emoji: "<:Flashlight:586217710371733536>"
    }, {
        default: (mods & 4096) > 0,
        label: "Spun Out",
        value: "4096",
        emoji: "<:SpunOut:586217719318315030>"
    }]
}

export const ParseSelectedMods = (interaction: SelectMenuInteraction) => {
    let res = 0
    interaction.values.forEach(val => res += parseInt(val))
    if (res & Mods.Bit.Easy && res & Mods.Bit.HardRock) res = res & (~Mods.Bit.Easy)
    if (res & Mods.Bit.HalfTime && res & Mods.Bit.DoubleTime) res = res & (~Mods.Bit.HalfTime)
    return res
}

export const BrokenInteraction = "This is not a command if you see this something is broken!"

export const cachePath = `${join(__dirname, "..", "cache")}`