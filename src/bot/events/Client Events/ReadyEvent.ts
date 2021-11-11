import { Bot } from "@client/Client"
import { Command } from "@interfaces/Command"
import { RunFunction } from "@interfaces/Event"

export const run: RunFunction = async (client: Bot) => {
    client.logger.success(`Logged on as ${client.user.tag}!`)
    client.user.setPresence({status: "online"})
    client.user.setActivity({
        name: "!invite",
        type: "PLAYING",
    })
    DisplayGuilds(client)
    //LogStatusLinks(client)
    //FunnyBansThing(client)
    AddSlashCommands(client)
}

const AddSlashCommands = async (client: Bot) => {
    const commands = {}
    let cmds: Command[] = []
    client.commands.map((value: Command) => commands[value.commandData.name] = value)
    for (const [key, value] of Object.entries(commands)) {
        cmds.push(value as Command)
    }
    let int = setInterval(() => {
        let cmd = cmds.pop().commandData
        client.guilds.cache.get("341153679992160266").commands.create(cmd)
        console.log(cmd);
        
        if (cmds.length == 0) clearInterval(int)
    }, 1000)
}

const DisplayGuilds = async (client: Bot) => {
    const guilds = await client.guilds.fetch()
    const o = {
        "List of all guilds:": []
    }
    guilds.each(guild => {
        o["List of all guilds:"].push(guild.name)
    })
    client.logger.info(o)
}

// eslint-disable-next-line
const LogStatusLinks = async (client: Bot) => {
    (await client.guilds.cache.get("854006362979827742").members.fetch()).forEach(e => {
        const activities = e.presence.activities
        
        for (let i = 0; i < activities.length; i++) {
            const el = activities[i]
            const name = el.name?.toLowerCase()
            const state = el.state?.toLowerCase()
            if (name?.includes(".gg") || name?.includes("resell") || name?.includes("re sell") || name?.includes("re-sell") || name?.includes("vouch")) client.logger.info(el.name)
            if (state?.includes(".gg") || state?.includes("resell") || state?.includes("re sell") || state?.includes("re-sell") || state?.includes("vouch")) client.logger.info(el.state)
        }
    })
}

// eslint-disable-next-line
const FunnyBansThing = async (client: Bot) => {
    let out = {};
    (await client.guilds.cache.get("854006362979827742").bans.fetch()).forEach(el => {
        if (!out[el.reason]) out[el.reason] = {
            reason: el.reason,
            count: 1,
            names: [el.user.username]
        }
        else {
            out[el.reason].names.push(el.user.username)
            out[el.reason].count++
        }
    })
    const sorted = []
    for (const key in out) {
        sorted.push([key, out[key]])
    }
    sorted.sort((el1, el2) => el1[1].count - el2[1].count)
    out = {}
    sorted.forEach(e => out[e[0]] = e[1])
    client.logger.log(out)
}
export const name = 'ready'