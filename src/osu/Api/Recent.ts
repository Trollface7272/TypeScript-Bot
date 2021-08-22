import { Score, linkBase, RecentParams as Params } from "./Api"
import axios from "axios"
import { RoundFixed, CommaFormat } from "../Utils"

const endpoint: string = linkBase + "api/get_user_recent"

export async function Get(params: Params): Promise<Array<Score>> {
    const data: any = (await axios.get(endpoint, { params })).data
    if (!data) throw { code: 5 }
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