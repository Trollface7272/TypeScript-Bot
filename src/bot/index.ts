import { Config } from "../shared/interfaces/Config"
import * as File from "../../config.json"
import { Bot } from "./client/Client"

export const Client = new Bot()
Client.Start(File as Config)