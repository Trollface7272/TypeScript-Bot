import { connect, connection, Connection, disconnect } from "mongoose"
import consola from "consola"
import * as File from "../../config.json"
import { Config } from "@interfaces/Config"
import { Guild, GuildMember } from "discord.js"
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

export const OnMessage = async (guild: Guild, author: GuildMember) => {
    try {
        await users.OnMessage(author)
        await guilds.OnMessage(guild)
    } catch (err) {
        logger.error(`Error writing into database => ` + err.message)
    }
}

export const OnCommand = async (guildId: string, userId: string) => {
    try {
        await users.OnCommand(userId)
        await guilds.OnCommand(guildId)
    } catch (err) {
        logger.error(`Error writing into database => ` + err.message)
    }
}

export const SkeetkeyUsed = async (guildId: string, userId: string) => {
    try {
        await users.SkeetkeyUsed(userId)
        await guilds.SkeetkeyUsed(guildId)
    } catch (err) {
        logger.error(`Error writing into database => ` + err.message)
    }
}