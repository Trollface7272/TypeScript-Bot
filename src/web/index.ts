import { Config } from "../shared/interfaces/Config"
import * as File from "../../config.json"
import Express from "express"
import path from "path"
import { list } from "./commands/List"
import { Moderation } from "./commands/Moderation"
//import { Client } from "../bot/index"

const app = Express()
const css = Express()
const resources = Express()
const commands = Express()

const port = (File as Config).web_port || 8080

/*-----------------------------------------------*/
/*                     Main                      */
/*-----------------------------------------------*/
app.all("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/html/index.html"))
})


/*-----------------------------------------------*/
/*                      css                      */
/*-----------------------------------------------*/
css.all("/index", (req, res) => {
    res.contentType("css")
    res.sendFile(path.join(__dirname, "/css/index.css"))
})

app.use("/css", css)


/*-----------------------------------------------*/
/*                   Resources                   */
/*-----------------------------------------------*/
resources.all("/botimage", (req, res) => {
    res.send("https://cdn.discordapp.com/avatars/584321366308814848/580686443db7d77c6d3fcecca1fcbc69.webp")
    //res.send(Client.user.avatarURL())
})


commands.all("/", (req, res) => {
    res.send(list)
})
commands.all("/moderation", (req, res) => {
    res.send(Moderation)
})
resources.use("/commands", commands)

app.use("/resources", resources)

app.listen(port)