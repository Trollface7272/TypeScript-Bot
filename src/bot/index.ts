import { Config } from "../interfaces/Config"
import * as File from "../../config.json"
import { Bot } from "./client/Client"
import { config } from "dotenv"

config()

export let Client: Bot

const crashHandle = () => {
    try {
        Client = new Bot()
        Client.Start(File as Config)
    } catch (e) {crashHandle()}
}
crashHandle()
