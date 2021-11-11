export interface Counts {
    "300": number
    "100": number
    "50": number
    katu: number
    geki: number
    miss: number
}

export interface Objects {
    Circle: number
    Slider: number
    Spinner: number
}

export interface Profile {
    code: number
    id: number
    Name: string
    RegisterDate: Date
    Country: string
    Playcount: {
        raw: number
        Formatted: string
    }
    Level: {
        raw: number
        Level: number
        Progress: string
    }
    Performance: {
        raw: number,
        Formatted: string
    }
    Rank: {
        Global: {
            raw: number
            Formatted: string
        }
        Country: {
            raw: number
            Formatted: string
        }
    }
    Accuracy: {
        raw: number
        Formatted: string
    }
    Playtime: {
        Raw: number
        Hours: number
        Minutes: number
        Seconds: number
    }
    HitCounts: {
        "300": number
        "100": number
        "50": number
    }
    RankCounts: {
        X: number
        XH: number
        S: number
        SH: number
        A: number
    }
    Score: {
        Ranked: {
            raw: number
            Formatted: string
        }
        Total: {
            raw: number
            Formatted: string
        }
    }
}

export interface Score {
    Index: number
    UserId: number
    Username: string
    MapId: number
    Score: {
        raw: number
        Formatted: string
    }
    Counts: Counts
    Combo: number
    Perfect: boolean
    Mods: number
    Date: Date
    Rank: string
    Performance: {
        raw: number
        Formatted: string
    }
    Downloadable: boolean
}

export interface Beatmap {
    id: number
    SetId: number
    Artist: string
    Source: string
    Title: string
    Version: string
    Genre: number
    Language: number
    Tags: string
    HasStoryboard: boolean
    HasVideo: boolean
    DownloadUnavailable: boolean
    AudioUnavailable: boolean

    FavouritedCount: number
    Rating: number
    Playcount: {
        raw: number
        Formatted: string
    }
    Passcount: {
        raw: number
        Formatted: string
    }


    Mapper: string
    MapperId: string


    bpm: number
    Difficulty: {
        Star: {
            raw: number
            Formatted: string
        }
        Aim: {
            raw: number
            Formatted: string
        }
        Speed: {
            raw: number
            Formatted: string
        }
        CircleSize: {
            raw: number
            Formatted: string
        }
        Overall: {
            raw: number
            Formatted: string
        }
        Approach: {
            raw: number
            Formatted: string
        }
        HealthDrain: {
            raw: number
            Formatted: string
        }
    }
    Length: {
        Total: {
            raw: number
            minutes: number
            seconds: number
            formatted: string
        }
        Drain: {
            raw: number
            minutes: number
            seconds: number
            formatted: string
        }
    }
    Objects: Objects
    MaxCombo: number
    Gamemode: number
    Approved: string
    ApprovedRaw: number
    SubmitedDate: Date
    ApprovedDate: Date
    LastUpdate: Date
    Hash: string
}

export interface ShortBeatmap {
    id: number
    SetId: number
    Artist: string
    Title: string
    Version: string

    Mapper: string

    Difficulty: {
        Star: {
            raw: number
            Formatted: string
        }
        Aim: {
            raw: number
            Formatted: string
        }
        Speed: {
            raw: number
            Formatted: string
        }
        CircleSize: {
            raw: number
            Formatted: string
        }
        Overall: {
            raw: number
            Formatted: string
        }
        Approach: {
            raw: number
            Formatted: string
        }
        HealthDrain: {
            raw: number
            Formatted: string
        }
    }
    Objects: Objects
    MaxCombo: number
    Gamemode: number
}

export interface BeatmapParams {
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

export interface ProfileParams {
    k?: string
    u: number | string
    m?: 0 | 1 | 2 | 3
    type?: "string" | "id"
    event_days?: number
}

export interface RecentParams {
    k?: string
    u: number | string
    m?: 0 | 1 | 2 | 3
    limit?: number
    type?: "string" | "id"
}

export interface ScoreParams {
    k?: string
    b: number
    mods?: number
    m?: 0 | 1 | 2 | 3
    u?: string | number
    limit?: number
    type?: "string" | "id"
}

export interface TopParams {
    k?: string
    u: number | string
    m?: 0 | 1 | 2 | 3
    limit?: number
    type?: "string" | "id"
}

export interface Performance {
    Accuracy: {
        raw: number
        Formatted: string
    }
    Speed: {
        raw: number
        Formatted: string
    }
    Aim: {
        raw: number
        Formatted: string
    }
    Total: {
        raw: number
        Formatted: string
    }
    AccuracyPercent: {
        raw: number
        Formatted: string
    }
}

export interface Difficulty {
    Aim: {
        raw: number
        Formatted: string
    }
    Speed: {
        raw: number
        Formatted: string
    }
    Total: {
        raw: number
        Formatted: string
    }
}