interface iProfileEventRaw {
    display_html:         string
    beatmap_id:           string
    beatmapset_id:        string
    date:                 string
    epicfactor:           string
}

export interface iProfileRaw {
    user_id:              string
    username:             string
    join_date:            string
    count300:             string
    count100:             string
    count50:              string
    playcount:            string
    ranked_score:         string
    total_score:          string
    pp_rank:              string
    level:                string
    pp_raw:               string
    accuracy:             string
    count_rank_ss:        string
    count_rank_ssh:       string
    count_rank_s:         string
    count_rank_sh:        string
    count_rank_a:         string
    country:              string
    total_seconds_played: string
    pp_country_rank:      string
    events:               iProfileEventRaw[]
}

export interface iProfileParams {
    k?: string
    u: number | string
    m?: 0 | 1 | 2 | 3
    type?: "string" | "id"
    event_days?: number
}