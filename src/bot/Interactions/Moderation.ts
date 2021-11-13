import { CommanOptions } from "@lib/Constants"
import { ApplicationCommandData, ApplicationCommandOptionData } from "discord.js"


const { TargetUser } = CommanOptions.Misc

const RetardRolesAdd: ApplicationCommandOptionData = {
    name: "add",
    description: "Add role to retard roles.",
    type: "SUB_COMMAND",
    options: [{
        name: "role",
        description: "Role to add to retard roles.",
        type: "ROLE",
        required: true
    }, {
        name: "position",
        description: "Position of this role.",
        type: "NUMBER",
        required: false
    }]
}
const RetardRolesList: ApplicationCommandOptionData = {
    name: "list",
    description: "List retard roles.",
    type: "SUB_COMMAND"
}
const RetardRolesClear: ApplicationCommandOptionData = {
    name: "clear",
    description: "Clear retard roles.",
    type: "SUB_COMMAND"
}
const RetardRolesRemove: ApplicationCommandOptionData = {
    name: "remove",
    description: "Remove retard roles.",
    type: "SUB_COMMAND",
    options: [{
        name: "role",
        description: "Role to remove",
        type: "ROLE",
        required: true
    }]
}
const RetardRoles: ApplicationCommandData = {
    name: "retardroles",
    description: "List retard roles.",
    type: "CHAT_INPUT",
    options: [RetardRolesAdd, RetardRolesList, RetardRolesClear, RetardRolesRemove],
    defaultPermission: true
}

const Retard: ApplicationCommandData = {
    name: "retard",
    description: "Retard.",
    options: [TargetUser],
    type: "CHAT_INPUT",
    defaultPermission: true
}

const UnRetard: ApplicationCommandData = {
    name: "unretard",
    description: "Unretard.",
    options: [TargetUser],
    type: "CHAT_INPUT",
    defaultPermission: true
}


const Moderation: ApplicationCommandData[] = [RetardRoles, Retard, UnRetard]


export default Moderation