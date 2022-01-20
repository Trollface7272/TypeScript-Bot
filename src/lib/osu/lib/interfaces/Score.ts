export interface iScoreParams {
    k?: string
    b: number
    mods?: number
    m?: 0 | 1 | 2 | 3
    u?: string | number
    limit?: number
    type?: "string" | "id"
}

export interface iRecentParams {
    k?: string
    u: number | string
    m?: 0 | 1 | 2 | 3
    limit?: number
    type?: "string" | "id"
}

export interface iTopParams {
    k?: string
    u: number | string
    m?: 0 | 1 | 2 | 3
    limit?: number
    type?: "string" | "id"
    useCache?: boolean
}

export interface iScoreRaw {
	score_id:		  string
    beatmap_id:       string
    score:			  string
    username:		  string
    count300:		  string
    count100:		  string
    count50:		  string
    countmiss:		  string
    maxcombo:		  string
    countkatu:		  string
    countgeki:		  string
    perfect:		  string
    enabled_mods:	  string
    user_id:		  string
    date:			  string
    rank:			  string
    pp:				  string
    replay_available: string
}

export interface iTopRaw {
    beatmap_id:       string
    score_id:         string
    score:            string
    maxcombo:         string
    count50:          string
    count100:         string
    count300:         string
    countmiss:        string
    countkatu:        string
    countgeki:        string
    perfect:          string
    enabled_mods:     string
    user_id:          string
    date:             string
    rank:             string
    pp:               string
    replay_available: string
}

export interface iScoreHitcounts {
    "300": number,
    "100": number,
    "50": number,
    katu?: number,
    geki?: number,
    miss: number
}