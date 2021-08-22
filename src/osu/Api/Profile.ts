import { Profile, linkBase, ProfileParams as Params } from "./Api"
import axios from "axios"
import { RoundFixed, CommaFormat } from "../Utils"
import consola from "consola"



const endpoint: string = linkBase + "api/get_user"
export async function Get(params: Params): Promise<Profile> {
    consola.debug({endpoint,params})
    
    const data: any = (await axios.get(endpoint, { params })).data[0]
    if (!data) throw { code: 4 }
    consola.debug({data})
    return {
        code: 0,
        id: parseInt(data.user_id),
        Name: data.username,
        RegisterDate: new Date(data.join_date),
        Country: data.country,
        Playcount: {
            raw: parseInt(data.playcount),
            Formatted: CommaFormat(parseInt(data.playcount)),
        },
        Level: {
            raw: parseFloat(data.level),
            Level: parseInt(data.level),
            Progress: ((parseFloat(data.level) - Math.floor(parseFloat(data.level))) * 100).toFixed(2),
        },
        Performance: {
            raw: parseFloat(data.pp_raw),
            Formatted: CommaFormat(RoundFixed(parseFloat(data.pp_raw)))
        },
        Rank: {
            Global: {
                raw: parseInt(data.pp_rank),
                Formatted: CommaFormat(parseInt(data.pp_rank)),
            },
            Country: {
                raw: parseInt(data.pp_country_rank),
                Formatted: CommaFormat(parseInt(data.pp_country_rank))
            },
        },
        Accuracy: {
            raw: parseFloat(data.accuracy),
            Formatted: RoundFixed(data.accuracy)
        },
        Playtime: {
            Raw: parseInt(data.total_seconds_played),
            Hours: Math.round(parseInt(data.total_seconds_played) / 60 / 60),
            Minutes: Math.round(parseInt(data.total_seconds_played) / 60 % 60),
            Seconds: parseInt(data.total_seconds_played) % 60,
        },
        HitCounts: {
            "300": parseInt(data.count300),
            "100": parseInt(data.count100),
            "50": parseInt(data.count50),
        },
        RankCounts: {
            X: parseInt(data.count_rank_ss),
            XH: parseInt(data.count_rank_ssh),
            S: parseInt(data.count_rank_s),
            SH: parseInt(data.count_rank_sh),
            A: parseInt(data.count_rank_a),
        },
        Score: {
            Ranked: {
                raw: parseInt(data.ranked_score),
                Formatted: CommaFormat(parseInt(data.ranked_score))
            },
            Total: {
                raw: parseInt(data.total_score),
                Formatted: CommaFormat(parseInt(data.total_score))
            },
        },
    }
}

export async function GetCached(params: Params): Promise<Profile> {
    return await Get(params)
}