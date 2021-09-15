import { Config } from "../../../shared/interfaces/Config"
import * as File from "../../../../config.json"
import Express from "express"
import path from "path"
import { Images } from "./resources/images"
import { Commands } from "./resources/commands"
import { CSS } from "./resources/css"
//import { Client } from "../bot/index"

const app = Express()
const resources = Express()

const port = (File as Config).web_ports.docs || 8080

/*-----------------------------------------------*/
/*                     Main                      */
/*-----------------------------------------------*/
app.all("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/../html/index.html"))
})


/*-----------------------------------------------*/
/*                      css                      */
/*-----------------------------------------------*/
app.use("/css", CSS)


/*-----------------------------------------------*/
/*                   Resources                   */
/*-----------------------------------------------*/
resources.use("/commands", Commands)
resources.use("/images", Images)




app.use("/resources", resources)

app.listen(port)