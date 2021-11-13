import { Config } from "../interfaces/Config"
import * as File from "../../config.json"
import { Bot } from "./client/Client"
import { config } from "dotenv"

config()

export const Client = new Bot()
Client.Start(File as Config)