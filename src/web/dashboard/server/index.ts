import Express from "express"
import * as File from "../../../../config.json"
import { Config } from "../../../shared/interfaces/Config"
import { MainPage } from "./main page/MainPage"
import { Resources } from "./Resources"
const port = (File as Config).web_ports.dashboard

const dashboard = Express()

dashboard.use("/", MainPage)
dashboard.use("/resources", Resources)

dashboard.listen(port)