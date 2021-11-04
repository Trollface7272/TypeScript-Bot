import { linkBase } from "./Api"
import axios from "axios"
import { RoundFixed, CommaFormat } from "../Utils"
import { RecentParams, Score } from "../../../interfaces/OsuApi"

const endpoint: string = linkBase + "api/get_user_recent"

interface user_recent {
    beatmap_id:   string
    score:        string
    maxcombo:     string
    count50:      string
    count100:     string
    count300:     string
    countmiss:    string
    countkatu:    string
    countgeki:    string
    perfect:      string
    enabled_mods: string
    user_id:      string
    date:         string
    rank:         string
}
export async function Get(params: RecentParams): Promise<Array<Score>> {
    const data: user_recent[] = (await axios.get(endpoint, { params })).data
    if (!data || data.length < 1) throw { code: 5 }
    const out: Array<Score> = []

    for (let i = 0; i < data.length; i++) {
        const el = data[i];
        out.push({
            Index: i+1,
            UserId: parseInt(el.user_id),
            Username: null,
            MapId: parseInt(el.beatmap_id),
            Score: {
                raw: parseInt(el.score),
                Formatted: CommaFormat(parseInt(el.score)),
            },
            Counts: {
                "300": parseInt(el.count300),
                "100": parseInt(el.count100),
                "50": parseInt(el.count50),
                katu: parseInt(el.countkatu),
                geki: parseInt(el.countgeki),
                miss: parseInt(el.countmiss),
            },
            Combo: parseInt(el.maxcombo),
            Perfect: (el.perfect == "1"),
            Mods: parseInt(el.enabled_mods),
            Date: new Date(el.date),
            Rank: el.rank,
            Performance: {
                raw: 0,
                Formatted: CommaFormat(RoundFixed(0))
            },
            Downloadable: false
        })
    }
    
    return out
}