import Express from "express"
import { Customization } from "../../commands/Customization"
import { Info } from "../../commands/Info"
import { List } from "../../commands/List"
import { Moderation } from "../../commands/Moderation"
import { Special } from "../../commands/Special"
import { osu } from "../../commands/osu"

const commands = Express()
commands.all("/list", (req, res) => {
    res.send(List)
})
commands.all("/customization", (req, res) => {
    res.send(Customization)
})
commands.all("/info", (req, res) => {
    res.send(Info)
})
commands.all("/moderation", (req, res) => {
    res.send(Moderation)
})
commands.all("/osu", (req, res) => {
    res.send(osu)
})
commands.all("/special", (req, res) => {
    res.send(Special)
})

export const Commands = commands