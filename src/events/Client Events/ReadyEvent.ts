import { Bot } from "../../client/Client";
import { RunFunction } from "../../interfaces/Event";
export const run: RunFunction = async (client) => {
    client.logger.success(`Logged on as ${client.user.tag}!`);
    //LogStatusLinks(client)
    //FunnyBansThing(client)
}

const LogStatusLinks = async (client: Bot) => {
    (await client.guilds.cache.get("854006362979827742").members.fetch()).forEach(e => {
        let activities = e.presence.activities
        
        for (let i = 0; i < activities.length; i++) {
            const el = activities[i]
            let name = el.name?.toLowerCase()
            let state = el.state?.toLowerCase()
            if (name?.includes(".gg") || name?.includes("resell") || name?.includes("re sell") || name?.includes("re-sell") || name?.includes("vouch")) client.logger.info(el.name)
            if (state?.includes(".gg") || state?.includes("resell") || state?.includes("re sell") || state?.includes("re-sell") || state?.includes("vouch")) client.logger.info(el.state)
        }
    })
}

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
    let sorted = []
    for (let key in out) {
        sorted.push([key, out[key]])
    }
    sorted.sort((el1, el2) => el1[1].count - el2[1].count)
    out = {}
    sorted.forEach(e => out[e[0]] = e[1])
    client.logger.log(out)
}
export const name: string = 'ready'