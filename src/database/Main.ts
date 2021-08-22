import { connect, connection, Connection, disconnect, Error } from "mongoose"
import consola, { Consola } from "consola"
import * as File from "../../config.json"
import { Config } from "../interfaces/Config"
import { Bot } from "../client/Client"
import { Message } from "discord.js"
import * as users from "./Users"
import * as guilds from "./Guilds"

const logger = consola
const link = (File as Config).mongo_db_url

export const GetOsuUsername = users.GetOsuUsername

export const AddFilter = guilds.AddFilter
export const RemoveFilter = guilds.RemoveFilter
export const GetFilter = guilds.GetFilter

export var database: Connection
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

export const OnMessage = async (discordClient: Bot, message: Message) => {
    try {
        await users.OnMessage(discordClient, message)
        await guilds.OnMessage(discordClient, message)
    } catch (err) {
        discordClient.logger.error(`Error writing into database => ` + err.message)
    }
}

export const OnCommand = async (discordClient: Bot, message: Message) => {
    try {
        await users.OnCommand(discordClient, message)
        await guilds.OnCommand(discordClient, message)
    } catch (err) {
        discordClient.logger.error(`Error writing into database => ` + err.message)
    }
}

export const SkeetkeyUsed = async (discordClient: Bot, message: Message) => {
    try {
        await users.SkeetkeyUsed(discordClient, message)
        await guilds.SkeetkeyUsed(discordClient, message)
    } catch (err) {
        discordClient.logger.error(`Error writing into database => ` + err.message)
    }
}