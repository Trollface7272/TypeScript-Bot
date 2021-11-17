import { linkBase } from "./Api"
import axios from "axios"
import { RoundFixed, CommaFormat, GetDiffMods, Mods } from "../Utils"
import { parser, ppv2, std_beatmap_stats } from "ojsama"
import { Beatmap, BeatmapParams, ShortBeatmap } from "../../../interfaces/OsuApi"
import { existsSync, writeFile } from "fs"
import { join } from "path"
import { cachePath } from "@lib/Constants"
import { mkdirSync } from "fs"


const endpoint: string = linkBase + "api/get_beatmaps"
const MapRanking = {
    "-2": "Graveyarded",
    "-1": "WIP",
    "0": "Pending",
    "1": "Ranked",
    "2": "Approved",
    "3": "Qualified",
    "4": "Loved"
}


let path = join(cachePath)
if (!existsSync(path)) mkdirSync(path)

path = join(path, "maps")
if (!existsSync(path)) mkdirSync(path)

for (let i = 0; i < 4; i++) {
    if (!existsSync(join(path, i+""))) mkdirSync(join(path, i+""))
}


//const cache = [{},{},{},{}]

interface beatmap {
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

export async function Get(params: BeatmapParams): Promise<Beatmap> {
    return v1(params)
}

export async function GetShort(params: BeatmapParams): Promise<ShortBeatmap> {
    if (params.m != 0) return v1(params)
    else return v2(params)
}

const v2 = async (params: BeatmapParams): Promise<ShortBeatmap> => {
    const beatmap = (await axios.get("https://osu.ppy.sh/osu/" + params.b)).data
    const parsed = new parser().feed(beatmap)
    
    const data = parsed.map
    const diff = new std_beatmap_stats({
        ar: data.ar, od: data.od, cs: data.cs, hp: data.hp
    }).with_mods(params.mods)
    const star = ppv2({
        map: data,
        mods: params.mods
    })

    return {
        id: data.beatmapId,
        SetId: data.beatmapsetId,
        Artist: data.artist,
        Title: data.title,
        Version: data.version,

        Mapper: data.creator,

        Difficulty: {
            Star: {
                raw: star.total,
                Formatted: RoundFixed(star.total),
            },
            Aim: {
                raw: star.aim,
                Formatted: RoundFixed(star.aim),
            },
            Speed: {
                raw: star.speed,
                Formatted: RoundFixed(star.speed),
            },
            CircleSize: {
                raw: data.cs,
                Formatted: RoundFixed(diff.cs)
            },
            Overall: {
                raw: data.od,
                Formatted: RoundFixed(diff.od)
            },
            Approach: {
                raw: data.ar,
                Formatted: RoundFixed(diff.ar)
            },
            HealthDrain: {
                raw: diff.hp,
                Formatted: RoundFixed(diff.hp)
            },
        },
        Objects: {
            Circle: data.ncircles,
            Slider: data.nsliders,
            Spinner: data.nspinners,
        },
        MaxCombo: data.max_combo(),
        Gamemode: data.mode,
    }
}

const v1 = async (params: BeatmapParams): Promise<Beatmap> => {
    params.a = 1
    params.mods = GetDiffMods(params.mods)
    const path = join(cachePath, "maps", params.m+"", params.mods+"", params.b+".json")
    if (existsSync(path)) return require(path)
    //if (cache[params.m]?.[params.mods]?.[params.b]) return cache[params.m][params.mods][params.b]
    const data: beatmap = (await axios.get(endpoint, { params })).data[0]
    if (!data) throw { code: 3 }
    
    let speed = 1
    if (params.mods & Mods.Bit.DoubleTime) 
        speed = 1.5
    else if (params.mods & Mods.Bit.HalfTime)
        speed = 0.75


    data.diff_approach = (CalculateApproach(parseFloat(data.diff_approach), speed, 1)).toString()
    data.diff_overall = (CalculateOverall(parseFloat(data.diff_overall), speed, 1)).toString()

    if (!existsSync(join(cachePath, "maps", params.m+"", params.mods+""))) mkdirSync(join(cachePath, "maps", params.m+"", params.mods+""))
    const parsed = {
        id: parseInt(data.beatmap_id),
        SetId: parseInt(data.beatmapset_id),
        Artist: data.artist,
        Source: data.source,
        Title: data.title,
        Version: data.version,
        Genre: parseInt(data.genre_id),
        Language: parseInt(data.language_id),
        Tags: data.tags,
        HasStoryboard: data.storyboard == "1",
        HasVideo: data.video == "1",
        DownloadUnavailable: data.download_unavailable == "1",
        AudioUnavailable: data.audio_unavailable == "1",

        FavouritedCount: parseInt(data.favourite_count),
        Rating: parseFloat(data.rating),
        Playcount: {
            raw: parseInt(data.playcount),
            Formatted: CommaFormat(parseInt(data.playcount)),
        },
        Passcount: {
            raw: parseInt(data.passcount),
            Formatted: CommaFormat(parseInt(data.passcount)),
        },

        Mapper: data.creator,
        MapperId: data.creator_id,

        bpm: parseFloat(data.bpm),
        Difficulty: {
            Star: {
                raw: parseFloat(data.difficultyrating),
                Formatted: RoundFixed(parseFloat(data.difficultyrating)),
            },
            Aim: {
                raw: parseFloat(data.diff_aim),
                Formatted: RoundFixed(parseFloat(data.diff_aim)),
            },
            Speed: {
                raw: parseFloat(data.diff_speed),
                Formatted: RoundFixed(parseFloat(data.diff_speed)),
            },
            CircleSize: {
                raw: parseFloat(data.diff_size),
                Formatted: RoundFixed(parseFloat(data.diff_size))
            },
            Overall: {
                raw: parseFloat(data.diff_overall),
                Formatted: RoundFixed(parseFloat(data.diff_overall))
            },
            Approach: {
                raw: parseFloat(data.diff_approach),
                Formatted: RoundFixed(parseFloat(data.diff_approach))
            },
            HealthDrain: {
                raw: parseFloat(data.diff_drain),
                Formatted: RoundFixed(parseFloat(data.diff_drain))
            },
        },
        Length: {
            Total: {
                raw: parseInt(data.total_length),
                minutes: Math.floor(parseInt(data.total_length) / 60),
                seconds: parseInt(data.total_length) % 60,
                formatted: ZeroFill(Math.floor(parseInt(data.total_length) / 60)) + ":" + ZeroFill(parseInt(data.total_length) % 60),
            },
            Drain: {
                raw: parseInt(data.hit_length),
                minutes: Math.floor(parseInt(data.hit_length) / 60),
                seconds: parseInt(data.hit_length) % 60,
                formatted: ZeroFill(Math.floor(parseInt(data.hit_length) / 60)) + ":" + ZeroFill(parseInt(data.hit_length) % 60),
            },
        },
        Objects: {
            Circle: parseInt(data.count_normal),
            Slider: parseInt(data.count_slider),
            Spinner: parseInt(data.count_spinner),
        },
        MaxCombo: parseInt(data.max_combo),
        Gamemode: parseInt(data.mode),
        Approved: MapRanking[data.approved],
        ApprovedRaw: parseInt(data.approved),
        SubmitedDate: new Date(data.submit_date),
        ApprovedDate: new Date(data.approved_date),
        LastUpdate: new Date(data.last_update),
        Hash: data.file_md5,
    }
    if (parsed.Approved == 4 || parsed.Approved == 1) writeFile(path, JSON.stringify(parsed), {encoding: "utf-8"}, () => null)

    return parsed
}

function ZeroFill(num: number): string {
    return num.toString().length > 1 ? num.toString() : "0" + num
}

const OD0_MS = 80
const OD10_MS = 20
const AR0_MS = 1800
const AR5_MS = 1200
const AR10_MS = 450
const OD_MS_STEP = (OD0_MS - OD10_MS) / 10.0
const AR_MS_STEP1 = (AR0_MS - AR5_MS) / 5.0
const AR_MS_STEP2 = (AR5_MS - AR10_MS) / 5.0

function CalculateApproach(base_ar: number, speed_mul: number, multiplier: number) {
    let ar = base_ar
    ar *= multiplier

    let arms = (
        ar < 5.0 ?
            AR0_MS - AR_MS_STEP1 * ar
            : AR5_MS - AR_MS_STEP2 * (ar - 5.0)
    )

    arms = Math.min(AR0_MS, Math.max(AR10_MS, arms))
    arms /= speed_mul

    ar = (
        arms > AR5_MS ?
            (AR0_MS - arms) / AR_MS_STEP1
            : 5.0 + (AR5_MS - arms) / AR_MS_STEP2
    )
    return ar
}

function CalculateOverall(base_od: number, speed_mul: number, multiplier: number) {
    let od = base_od
    od *= multiplier
    let odms = OD0_MS - Math.ceil(OD_MS_STEP * od)
    odms = Math.min(OD0_MS, Math.max(OD10_MS, odms))
    odms /= speed_mul
    od = (OD0_MS - odms) / OD_MS_STEP
    return od
}