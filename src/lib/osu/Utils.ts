import { GuildMember, Message, MessageOptions, TextBasedChannels } from "discord.js"
import { modbits } from "ojsama"
import { Embed, logger } from "@client/Client"
import { Counts, Objects } from "@interfaces/OsuApi"
import { GetOsuUsername } from "@database/Users"

const CommandGamemodes = {
    "taiko": 1,
    "taikotop": 1,
    "ctb": 2,
    "ctbtop": 2,
    "mania": 3,
    "maniatop": 3
}

export const Mods = {
    Bit: {
        None: 0,
        NoFail: 1 << 0,
        Easy: 1 << 1,
        TouchDevice: 1 << 2,
        Hidden: 1 << 3,
        HardRock: 1 << 4,
        SuddenDeath: 1 << 5,
        DoubleTime: 1 << 6,
        Relax: 1 << 7,
        HalfTime: 1 << 8,
        Nightcore: 1 << 9,
        Flashlight: 1 << 10,
        Autoplay: 1 << 11,
        SpunOut: 1 << 12,
        Relax2: 1 << 13,
        Perfect: 1 << 14,
        Key4: 1 << 15,
        Key5: 1 << 16,
        Key6: 1 << 17,
        Key7: 1 << 18,
        Key8: 1 << 19,
        FadeIn: 1 << 20,
        Random: 1 << 21,
        Cinema: 1 << 22,
        Target: 1 << 23,
        Key9: 1 << 24,
        KeyCoop: 1 << 25,
        Key1: 1 << 26,
        Key3: 1 << 27,
        Key2: 1 << 28,
        ScoreV2: 1 << 29,
        Mirror: 1 << 30
    },
    Names: {
        None: "No Mod",
        NoFail: "NF",
        Easy: "EZ",
        TouchDevice: "TD",
        Hidden: "HD",
        HardRock: "HR",
        SuddenDeath: "SD",
        DoubleTime: "DT",
        Relax: "RX",
        HalfTime: "HT",
        Nightcore: "NC",
        Flashlight: "FL",
        Autoplay: "AU",
        SpunOut: "SO",
        Relax2: "AP",
        Perfect: "PF",
        Key4: "4K",
        Key5: "5K",
        Key6: "6K",
        Key7: "7K",
        Key8: "8K",
        FadeIn: "FI",
        Random: "RD",
        Cinema: "CN",
        Target: "TP",
        Key9: "9K",
        KeyCoop: "2P",
        Key1: "1K",
        Key3: "3K",
        Key2: "2K",
        ScoreV2: "V2",
        Mirror: "MR"
    },
}

const DifficultyEmoteIds = [
    ["858310858303864852", "858310858362978324", "858310858311729163", "858310858165190667", "858310858299408384", "858310857909075999"],
    ["858310830269399071", "858310830847557642", "858310830763671572", "858310830671003649", "858310830927118356", "858310830714257408"],
    ["858310941186850876", "858310941208215582", "858310941178724372", "858310941263134720", "858310941170466836", "858310941182394398"],
    ["858310914922381343", "858310915279290398", "858310915053322251", "858310914959605763", "858310915241803796", "858310915266445322"],
]

const Errors = [
    '',
    '**🔴 Please specify user or set default one using osuset command.**',
    '**🔴 Unknown error occured while getting {Where}.**',
    '**🔴 Map not found.**',
    '**🔴 ${Name} not found.**',
    '**🔴 ${Name} has no recent plays.**',
    '**🔴 ${Name} has no top plays.**',
    '**🔴 ${Name} has no scores on given map.**',
]

export const ErrorIds = {
    NoUsername: 1,
    UnknownError: 2,
    MapNotFound: 3,
    UserNotFound: 4,
    NoRecentPlays: 5,
    NotTopPlays: 6,
    NoScores: 7,
}

export const ModNames = {
    Name: ["Standard", "Taiko", "Catch the Beat!", "Mania"],
    Link: ["osu", "taiko", "fruits", "mania"]
}

export interface Args {
    Name: string,
    Flags: Flags
}
export interface Flags {
    m: 0 | 1 | 2 | 3
    b?: boolean
    rv?: boolean
    g?: number | false
    p?: Array<number> | false
    mods?: number
    acc?: number
    map?: number
    rand?: boolean
    l?: boolean
}
interface Error {
    code: number
}

export const ParseArgs = async (message: Message, args: string[]) => {
    const cmd = message.content.toLocaleLowerCase().split(" ")[0].substr(1)
    const out = {
        Name: null,
        Flags: {
            m: CommandGamemodes[cmd] || 0,
            b: null,
            rv: null,
            g: null,
            p: null,
            mods: 0,
            acc: null,
            map: null,
            rand: null,
            l: null
        }
    }

    for (let i = 0; i < args.length; i++) {
        const el = args[i]
        if (el == "b") out.Flags.b = true
        else if (el == "r") out.Flags.b = true
        else if (el == "o") { out.Flags.rv = true; out.Flags.b = true }
        else if (el == "rv") out.Flags.rv = true
        else if (el == "rand") out.Flags.rand = true
        else if (el == "l") out.Flags.l = true
        else if (el == "g") {
            if (i == args.length - 1) break
            out.Flags.g = args[i + 1]
            i++
        }
        else if (!isNaN(parseInt(el)) && parseInt(el) > 0 && parseInt(el) <= 100) {
            if (!out.Flags.p) out.Flags.p = []
            out.Flags.p.push(parseInt(el) - 1)
        }
        else if (el == "m") {
            if (i == args.length - 1) break
            out.Flags.m = args[i + 1]
            if (isNaN(out.Flags.m)) out.Flags.m = CommandGamemodes[out.Flags.m] || 0
            else out.Flags.m = parseInt(out.Flags.m)
            i++
        }
        else if (el.startsWith("+")) out.Flags.mods |= GetModsFromString(el.substr(1))
        else if (el.includes("osu.ppy.sh")) out.Flags.map = parseInt(el.split("/").pop())
        else if (el.length >= 3) out.Name = el
    }
    if (cmd == "map" || cmd == "m" || cmd == "c" || cmd == "compare") {
        if (!out.Flags.map) out.Flags.map = await FindMapInConversation(message.channel)
    }
    if (!out.Name) {
        out.Name = await GetOsuUsername(message.author.id)
    }
    logger.info(out)
    return out
}

export const FindMapInConversation = async (channel: TextBasedChannels): Promise<string> => {
    const messages = await channel.messages.fetch({ limit: 50 })
    let map: string
    messages.forEach(msg => {
        if (msg.embeds.length < 1 || map) return

        if (msg.embeds[0].author?.url?.startsWith("https://osu.ppy.sh/b/")) {
            map = map || msg.embeds[0].author && msg.embeds[0].author.url.split("https://osu.ppy.sh/b/")[1]
            map = map.replace(/[)]/g, "")
            return map
        } else if (msg.embeds[0].description?.includes("https://osu.ppy.sh/b/")) {
            map = map || msg.embeds[0].description.split("https://osu.ppy.sh/b/", 2)[1].split(")")[0]
            map = map.replace(/[)]/g, "")
            return map
        }

    })
    return map || "Not Found"
}

export const RoundFixed = (num: number, digits = 2): string => {
    return (Math.round(num * Math.pow(10, digits)) / Math.pow(10, digits)).toFixed(digits)
}

export function CommaFormat(num: number|string): string {
    let n: number = typeof num == "number" ? num : parseFloat(num)
    return n.toLocaleString()
}

export const GetFlagUrl = (country: string): string => {
    return `https://flagcdn.com/w80/${country.toLowerCase()}.png`
}

export const GetProfileLink = (id: number, mode: 0 | 1 | 2 | 3): string => {
    return `https://osu.ppy.sh/users/${id}/${ModNames.Link[mode]}`
}

export const GetServer = (): string => {
    return `On osu! Official Server`
}

export const GetProfileImage = (id: number): string => {
    return `http://s.ppy.sh/a/${id}?newFix=${new Date().getTime()}`
}

export const HandleError = (author: GuildMember, err: Error, name: string): MessageOptions => {
    if (err.code) return ({ embeds: [Embed({ description: Errors[err.code].replace("${Name}", name) }, author.user)] })
    else logger.error(new Error(JSON.stringify(err)))
}

export const RankingEmotes = (ranking: string): string => {
    switch (ranking) {
        case "XH":
            return "<:RankingXH:585737970816909322>"
        case "SH":
            return "<:RankingSH:585737970246615050>"
        case "X":
            return "<:RankingX:585737970384896017>"
        case "S":
            return "<:RankingS:585737969885904897>"
        case "A":
            return "<:RankingA:585737969927716866>"
        case "B":
            return "<:RankingB:585737970150277131>"
        case "C":
            return "<:RankingC:585737970200477696>"
        case "D":
        case "F":
            return "<:RankingF:585737969877385217>"
        default:
            logger.error(`Unknown emoji ${ranking}`)
            return "<:RankingF:585737969877385217>"
    }
}

export const CalculateAcc = (counts: Counts, mode: number): string => {
    switch (mode) {
        case 0:
            return RoundFixed((counts[300] * 300 + counts[100] * 100 + counts[50] * 50) / ((counts[300] + counts[100] + counts[50] + counts.miss) * 300) * 100)
        case 1:
            return RoundFixed((counts[300] + counts[100] * 0.5) / (counts[300] + counts[100] + counts.miss) * 100)
        case 2:
            return RoundFixed((counts[300] + counts[100] + counts[50]) / (counts[300] + counts[100] + counts[50] + counts.miss + counts.katu) * 100)
        case 3:
            return RoundFixed((300 * (counts[300] + counts.geki) + 200 * counts.katu + 100 * counts[100] + 50 * counts[50]) / (300 * (counts.geki + counts[300] + counts.katu + counts[100] + counts[50] + counts.miss)) * 100)
        default:
            logger.error(`Unknown gamemode: ${mode}`)
            return "Unknown"
    }
}

export const GetHits = (counts: Counts, mode: number): string => {
    switch (mode) {
        case 1:
        case 0:
            return `${counts[300]}/${counts[100]}/${counts[50]}/${counts.miss}`
        case 2:
            return `${counts[300]}/${counts[100]}/${counts[50]}/${counts.katu}/${counts.miss}`
        case 3:
            return `${counts.geki}/${counts[300]}/${counts.katu}/${counts[100]}/${counts[50]}/${counts.miss}`
        default:
            logger.error(`Unknown gamemode: ${mode}`)
            return "Unknown"
    }
}

export const CalculateProgress = (counts: Counts, objects: Objects, mode: number): string => {
    switch (mode) {
        case 1:
        case 0:
            return RoundFixed((counts[300] + counts[100] + counts[50] + counts.miss) / (objects.Circle + objects.Slider + objects.Spinner) * 100)
        case 2:
            return RoundFixed((counts[300] + counts[100] + counts[50] + counts.miss + counts.katu) / (objects.Circle + objects.Slider + objects.Spinner) * 100)
        case 3:
            return RoundFixed((counts.geki + counts[300] + counts.katu + counts[100] + counts[50] + counts.miss + counts.katu) / (objects.Circle + objects.Slider + objects.Spinner) * 100)
        default:
            logger.error(`Unknown gamemode: ${mode}`)
            return "Unknown"
    }
}

export const ConvertBitMods = (mods: number): string => {
    if (mods == 0) return "No Mod"

    let resultMods = ""
    if (mods & Mods.Bit.Perfect) mods &= ~Mods.Bit.SuddenDeath
    if (mods & Mods.Bit.Nightcore) mods &= ~Mods.Bit.DoubleTime
    for (const mod in Mods.Bit) {
        if (Mods.Bit[mod] & mods)
            resultMods += Mods.Names[mod]
    }
    return resultMods
}

export const GetMapLink = (id: number): string => {
    return `https://osu.ppy.sh/b/${id}`
}

export const GetMapImage = (id: number): string => {
    return `https://b.ppy.sh/thumb/${id}l.jpg`
}

export const DateDiff = (date1: Date, date2: Date) => {
    const diff: number = date2.getTime() - date1.getTime()
    const out: Array<string> = []
    const years: number = Math.floor(diff / 1000 / 60 / 60 / 24 / 30 / 12)
    if (years > 0) out.push(`${years} Year${years > 1 ? "s" : ""} `)

    const months: number = Math.floor(diff / 1000 / 60 / 60 / 24 / 30 % 12)
    if (months > 0) out.push(`${months} Month${months > 1 ? "s" : ""} `)

    const days: number = Math.floor(diff / 1000 / 60 / 60 / 24 % 30)
    if (days > 0) out.push(`${days} Day${days > 1 ? "s" : ""} `)

    const hours: number = Math.floor(diff / 1000 / 60 / 60 % 24)
    if (hours > 0) out.push(`${hours} Hour${hours > 1 ? "s" : ""} `)

    const minutes: number = Math.floor(diff / 1000 / 60 % 60)
    if (minutes > 0) out.push(`${minutes} Minute${minutes > 1 ? "s" : ""} `)

    const seconds: number = Math.floor(diff / 1000 % 60)
    if (seconds > 0) out.push(`${seconds} Second${seconds > 1 ? "s" : ""} `)

    return out[0] + (out[1] || "")
}

export const GetDiffMods = (mods: number) => {
    return (mods & Mods.Bit.DoubleTime | mods & Mods.Bit.HalfTime | mods & Mods.Bit.HardRock | mods & Mods.Bit.Easy)
}

export const GetCombo = (combo: number, maxCombo: number, mode: number): string => {
    if (mode == 3) return `x${combo}`
    return `x${combo}/${maxCombo}`
}

export const GetModsFromString = (mods: string) => {
    if (!mods.startsWith("+")) mods += "+"
    return modbits.from_string(mods)
}

export const GetDifficultyEmote = (mode: 0|1|2|3, star: number) => {
    let difficulty = 0
    if (star > 2) difficulty++
    if (star > 2.7) difficulty++
    if (star > 4) difficulty++
    if (star > 5.3) difficulty++
    if (star > 6.5) difficulty++
    return `<:Black:${DifficultyEmoteIds[mode][difficulty]}>`
}