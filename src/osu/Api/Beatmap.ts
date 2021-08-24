import { linkBase } from "./Api"
import axios from "axios"
import { RoundFixed, CommaFormat, GetDiffMods, Mods } from "../Utils"
import { parser, ppv2, std_beatmap_stats } from "ojsama"
import { Beatmap, BeatmapParams, ShortBeatmap } from "../../interfaces/OsuApi"


const endpoint: string = linkBase + "api/get_beatmaps"

export async function Get(params: BeatmapParams): Promise<Beatmap> {
    return v1(params)
}

export async function GetShort(params: BeatmapParams): Promise<ShortBeatmap> {
    if (params.m != 0) return v1(params)
    else return v2(params)
}

const v2 = async (params: BeatmapParams): Promise<ShortBeatmap> => {
    let beatmap = (await axios.get("https://osu.ppy.sh/osu/" + params.b)).data
    let parsed = new parser().feed(beatmap)
    
    let data = parsed.map
    let diff = new std_beatmap_stats({
        ar: data.ar, od: data.od, cs: data.cs, hp: data.hp
    }).with_mods(params.mods)
    let star = ppv2({
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
    const data: any = (await axios.get(endpoint, { params })).data[0]
    if (!data) throw { code: 3 }
    
    let multiplier = 1
    if (params.mods & Mods.Bit.DoubleTime) 
        multiplier = 1.5
    else if (params.mods & Mods.Bit.HalfTime)
        multiplier = 0.75

    data.diff_approach = CalculateApproach(parseFloat(data.diff_approach), multiplier, 1)
    data.diff_overall = CalculateOverall(parseFloat(data.diff_overall), multiplier, 1)

    return {
        id: parseInt(data.beatmap_id),
        SetId: parseInt(data.beatmapset_id),
        Artist: data.artist,
        Source: data.source,
        Title: data.title,
        Version: data.version,
        Genre: data.genre_id,
        Language: data.language_id,
        Tags: data.tags,
        HasStoryboard: data.storyboard == "1",
        HasVideo: data.video == "1",
        DownloadUnavailable: data.download_unavailable == "1",
        AudioUnavailable: data.audio_unavailable == "1",

        FavouritedCount: data.favourite_count,
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
        Gamemode: data.mode,
        Approved: data.approved,
        SubmitedDate: new Date(data.submit_date),
        ApprovedDate: new Date(data.approved_date),
        LastUpdate: new Date(data.last_update),
        Hash: data.file_md5,
    }
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