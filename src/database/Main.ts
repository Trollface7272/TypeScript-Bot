import { connect, connection, Connection, disconnect } from "mongoose"
import consola from "consola"
import * as File from "../../config.json"
import { Config } from "../interfaces/Config"
import { Bot } from "../bot/client/Client"
import { Message } from "discord.js"
import * as users from "./Users"
import * as guilds from "./Guilds"
import * as tracking from "./Tracking"

const logger = consola
const link = (File as Config).mongo_db_url

export const Users = users

export const Guilds = guilds

export const Tracking = tracking
export let database: Connection
export const Connect = async () => {
    if (database) return
    logger.info(`Connecting to database`)
    await connect(link, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    })
    logger.success(`Connected to database => ` + connection.name)

    database = connection

    return database
}

export const Disconnect = async () => {
    if (!database) return
    disconnect()
    database = null
}

export const OnMessage = async (client: Bot, message: Message) => {
    try {
        await users.OnMessage(client, message)
        await guilds.OnMessage(client, message)
    } catch (err) {
        client.logger.error(`Error writing into database => ` + err.message)
    }
}

export const OnCommand = async (client: Bot, message: Message) => {
    try {
        await users.OnCommand(client, message)
        await guilds.OnCommand(client, message)
    } catch (err) {
        client.logger.error(`Error writing into database => ` + err.message)
    }
}

export const SkeetkeyUsed = async (client: Bot, message: Message) => {
    try {
        await users.SkeetkeyUsed(client, message)
        await guilds.SkeetkeyUsed(client, message)
    } catch (err) {
        client.logger.error(`Error writing into database => ` + err.message)
    }
}