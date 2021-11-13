import { BrokenInteraction, CommanOptions } from "@lib/Constants"
import { ApplicationCommandData, ApplicationCommandOptionData } from "discord.js"

const { Username, Gamemode, MapId, MapLink, Mods, ModsRaw, List, GreaterThan, Reversed, Best, Specific, Random } = CommanOptions.osu

const Track: ApplicationCommandOptionData = {
    name: "track",
    description: BrokenInteraction,
    type: "SUB_COMMAND_GROUP",
    options: [{
        name: "add",
        description: "Add user to tracking.",
        type: "SUB_COMMAND",
        options: [Username, Gamemode]
    }, {
        name: "clear",
        description: "Clear tracking in this channel.",
        type: "SUB_COMMAND"
    }, {
        name: "list",
        description: "List all tracked users in this channel.",
        type: "SUB_COMMAND"
    }]
}

const Compare: ApplicationCommandOptionData = {
    name: "compare",
    description: "Show score on the last map in conversation.",
    options: [Username, Gamemode],
    type: "SUB_COMMAND"
}

const CountMods: ApplicationCommandOptionData = {
    name: "countmods",
    description: "Show mod combinations in top 100.",
    options: [Username, Gamemode],
    type: "SUB_COMMAND"
}

const Map: ApplicationCommandOptionData = {
    name: "map",
    description: "Show info about map.",
    options: [MapId, MapLink, Mods, ModsRaw, Gamemode],
    type: "SUB_COMMAND"
}

const Profile: ApplicationCommandOptionData = {
    name: "profile",
    description: "Get osu profile.",
    options: [Username, Gamemode],
    type: "SUB_COMMAND"
}

const Set: ApplicationCommandOptionData = {
    name: "set",
    description: BrokenInteraction,
    options: [{
        name: "username",
        description: "Set your osu username.",
        type: "SUB_COMMAND",
        options: [Username]
    }],
    type: "SUB_COMMAND_GROUP",
}

const Recent: ApplicationCommandOptionData = {
    name: "recent",
    description: "Get recent osu play.",
    options: [Username, Gamemode, List, Best, GreaterThan, Reversed],
    type: "SUB_COMMAND"
}

const Top: ApplicationCommandOptionData = {
    name: "top",
    description: "get top 5 plays.",
    options: [Username, Gamemode, Best, GreaterThan, Reversed, Specific, Random],
    type: "SUB_COMMAND"
}

const osu: ApplicationCommandData[] = [{
    name: "osu",
    description: BrokenInteraction,
    options: [Track, Compare, CountMods, Map, Profile, Set, Recent, Top],
    type: "CHAT_INPUT",
    defaultPermission: true
}]

export default osu