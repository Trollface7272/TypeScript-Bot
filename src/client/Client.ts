import { Client, Collection, Intents, Message, MessageEmbed, MessageEmbedOptions } from "discord.js"
import consola, { Consola, LogLevel } from "consola"
import { Command } from "../interfaces/Command"
import { Event } from "../interfaces/Event"
import { Config } from "../interfaces/Config"
import { promisify } from "util"
import * as database from "../database/Main"
import glob from "glob"

const gPromise = promisify(glob)

class Bot extends Client {
    public logger: Consola = consola
    public database = database
    public commands: Collection<string, Command> = new Collection()
    public events: Collection<string, Event> = new Collection()
    public config: Config
    public constructor() {
        super({
            intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_PRESENCES],
        })
        consola.wrapStd()
        database.Connect().then(v => this.database.database = v)
        //consola.level = LogLevel.Debug
    }
    public async Start(config: Config): Promise<void> {
        this.config = config
        this.login(config.discord_token)
        const commandFiles: string[] = await gPromise(`${__dirname}/../commands/**/*{.ts,.js}`)
        commandFiles.map(async (value: string) => {
            const file: Command = await import(value)
            if (typeof file.name == "string") this.commands.set(file.name, file)
            else for (let i = 0; i < file.name.length; i++) this.commands.set(file.name[i], file)
        })
        const eventFiles: string[] = await gPromise(`${__dirname}/../events/**/*{.ts,.js}`)
        eventFiles.map(async (value: string) => {
            const file: Event = await import(value)
            this.events.set(file.name, file)
            this.on(file.name, file.run.bind(null, this))
        })
    }
    public embed(options: MessageEmbedOptions, message: Message): MessageEmbed {
        return new MessageEmbed({...options, color: "RANDOM"}).setFooter(`${message.author.tag}`, message.author.displayAvatarURL({ format: "png", dynamic: true}))
    }
}


export { Bot }