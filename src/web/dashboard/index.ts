import Express from "express"
import * as File from "../../../config.json"
import { Config } from "../../shared/interfaces/Config"
const port = (File as Config).web_ports.dashboard

const dashboard = Express()




dashboard.listen(port)