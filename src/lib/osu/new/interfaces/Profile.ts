import { OsuProfile } from "../Endpoints/Profile"

interface iProfileEventRaw {
    display_html: string
    beatmap_id: string
    beatmapset_id: string
    date: string
    epicfactor: string
}
export interface iProfileCache {
    [key: string]: { profile: OsuProfile, expire: number }
}

export interface iProfileRaw {
    user_id: string
    username: string
    join_date: string
    count300: string
    count100: string
    count50: string
    playcount: string
    ranked_score: string
    total_score: string
    pp_rank: string
    level: string
    pp_raw: string
    accuracy: string
    count_rank_ss: string
    count_rank_ssh: string
    count_rank_s: string
    count_rank_sh: string
    count_rank_a: string
    country: string
    total_seconds_played: string
    pp_country_rank: string
    events: iProfileEventRaw[]
}

export interface iProfileParams {
    k?: string
    u: number | string
    m?: 0 | 1 | 2 | 3
    type?: "string" | "id"
    event_days?: number
}

export interface iProfileFormatted {
    Registered: string, PlayCount: string, Level: string, Performence: string,
    Accuracy: string, Playtime: string,
    Hitcounts: { "300": string, "100": string, "50": string }
    Ranks: { X: string, XH: string, S: string, SH: string, A: string },
    Rank: { Country: string, Global: string },
    Score: { Total: string, Ranked: string }
}

export interface iProfileScore {
    Total: number,
    Ranked: number
}

export interface iProfileRanks {
    X: number,
    XH: number,
    S: number,
    SH: number,
    A: number
}

export interface iProfileHitcounts {
    "300": number,
    "100": number,
    "50": number
}

export interface iProfileRank {
    Country: number,
    Global: number
}