import { linkBase } from "./Api"
import axios from "axios"
import { RoundFixed, CommaFormat } from "../Utils"
import { Score, ScoreParams } from "../../../shared/interfaces/OsuApi"



const endpoint: string = linkBase + "api/get_scores"

export async function Get(params: ScoreParams): Promise<Array<Score>> {
    const data: any = (await axios.get(endpoint, { params })).data
    if (!data) throw { code: 5 }
    const out: Array<Score> = []

    for (let i = 0; i < data.length; i++) {
        const el = data[i]
        out.push({
            Index: i + 1,
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
                raw: parseFloat(el.pp),
                Formatted: CommaFormat(RoundFixed(parseFloat(el.pp)))
            },
            Downloadable: el.replay_available == "1"
        })
    }

    return out
}