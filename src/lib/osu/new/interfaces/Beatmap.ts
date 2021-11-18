export interface iBeatmapParams {
    k?: string
    since?: Date
    s?: number
    b?: number
    u?: number
    h?: string
    type?: "string" | "id"
    m?: 0 | 1 | 2 | 3
    a?: 0 | 1
    limit?: number
    mods?: number
}

export interface iBeatmapRaw {
    approved:             string
    submit_date:          string
    approved_date:        string
    last_update:          string
    artist:               string
    beatmap_id:           string
    beatmapset_id:        string
    bpm:                  string
    creator:              string
    creator_id:           string
    difficultyrating:     string
    diff_aim:             string
    diff_speed:           string
    diff_size:            string
    diff_overall:         string
    diff_approach:        string
    diff_drain:           string
    hit_length:           string
    source:               string
    genre_id:             string
    language_id:          string
    title:                string
    total_length:         string
    version:              string
    file_md5:             string
    mode:                 string
    tags:                 string
    favourite_count:      string
    rating:               string
    playcount:            string
    passcount:            string
    count_normal:         string
    count_slider:         string
    count_spinner:        string
    max_combo:            string
    storyboard:           string
    video:                string
    download_unavailable: string
    audio_unavailable:    string
}


export interface iBeatmapDifficulty {
    Star: number,
    Aim: number,
    Speed: number,
    CircleSize: number,
    Overall: number,
    Approach: number,
    HealthDrain: number
}

export interface iBeatmapDifficultyFormatted {
    Star: string,
    Aim: string,
    Speed: string,
    CircleSize: string,
    Overall: string,
    Approach: string,
    HealthDrain: string
}

export interface iBeatmapObjects {
    Circles: number,
    Sliders: number,
    Spinners: number
}