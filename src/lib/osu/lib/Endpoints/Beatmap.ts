import axios from "axios"
import { AddToCache, GetCached } from "../cache/Beatmap"
import { osuApiKey, url } from "../Constants"
import { GetDiffMods, RoundFixed, ZeroFill } from "../Functions"
import { iBeatmapDifficulty, iBeatmapFormatted, iBeatmapLength, iBeatmapObjects, iBeatmapParams, iBeatmapRaw } from "../interfaces/Beatmap"


const Mods = {
    None: 0,
    NoFail: 1 << 0,
    Easy: 1 << 1,
    TouchDevice: 1 << 2,
    Hidden: 1 << 3,
    HardRock: 1 << 4,
    SuddenDeath: 1 << 5,
    DoubleTime: 1 << 6,
    Relax: 1 << 7,
    HalfTime: 1 << 8,
    Nightcore: 1 << 9,
    Flashlight: 1 << 10,
    Autoplay: 1 << 11,
    SpunOut: 1 << 12,
    Relax2: 1 << 13,
    Perfect: 1 << 14,
    Key4: 1 << 15,
    Key5: 1 << 16,
    Key6: 1 << 17,
    Key7: 1 << 18,
    Key8: 1 << 19,
    FadeIn: 1 << 20,
    Random: 1 << 21,
    Cinema: 1 << 22,
    Target: 1 << 23,
    Key9: 1 << 24,
    KeyCoop: 1 << 25,
    Key1: 1 << 26,
    Key3: 1 << 27,
    Key2: 1 << 28,
    ScoreV2: 1 << 29,
    Mirror: 1 << 30
}


export class OsuBeatmap {
    private endPoint = url + "get_beatmaps"
    private MapRanking = {
        "-2": "Graveyarded",
        "-1": "WIP",
        "0": "Pending",
        "1": "Ranked",
        "2": "Approved",
        "3": "Qualified",
        "4": "Loved"
    }

    public id: number
    public SetId: number
    public Artist: string
    public Source: string
    public Title: string
    public Version: string
    public Genre: number
    public Language: number
    public Tags: string
    public HasStoryBoard: boolean
    public HasVideo: boolean
    public Downloadable: boolean
    public HasAudio: boolean
    public FavouritedCount: number
    public Rating: number
    public Playcount: number
    public PassCount: number
    public MapperId: number
    public Mapper: string
    public Bpm: number
    public Difficulty: iBeatmapDifficulty
    public Objects: iBeatmapObjects
    public Length: iBeatmapLength
    public Approved: string
    public ApprovedRaw: number
    public ApprovedDate: Date
    public SubmitedDate: Date
    public LastUpdate: Date
    public Hash: string
    public Combo: number
    public Mode: 0 | 1 | 2 | 3

    public Formatted: iBeatmapFormatted

    public async Load (params: iBeatmapParams) {
        if (!params.m) params.m = 0
        params.a = 1
        params.mods = GetDiffMods(params.mods || 0)
        let data: iBeatmapRaw = await GetCached(params.m.toString(), params.mods.toString(), params.b.toString())
        const exists = data ? true : false
        if (!params.k) params.k = osuApiKey
        
        data = exists ? data : (await axios.get(this.endPoint, { params })).data[0]
        if (!data) throw { code: 3 }
        if (!exists && (data.approved == "4" || data.approved == "1")) AddToCache(params.m.toString(), params.mods.toString(), params.b.toString(), data)
        
        const multiplier = (params.mods & Mods.HardRock) !== 0 ? 1.4 : (params.m & Mods.Easy) !== 0 ? 0.5 : 1
        const speed = (params.mods & Mods.DoubleTime) !== 0 ? 1.5 : (params.m & Mods.HalfTime) !== 0 ? 0.75 : 1
        data.diff_approach = (CalculateApproach(parseFloat(data.diff_approach), speed, multiplier)).toString()
        data.diff_overall = (CalculateOverall(parseFloat(data.diff_overall), speed, multiplier)).toString()

        this.LoadData(data)
        this.LoadFormattedData()
        return this
    }

    private LoadData (data: iBeatmapRaw) {
        const {
            approved, approved_date, artist, audio_unavailable, beatmap_id, beatmapset_id, bpm, count_normal, count_slider, count_spinner, creator, creator_id, diff_aim, diff_approach, diff_drain, diff_overall, diff_size, diff_speed, difficultyrating, download_unavailable, favourite_count, file_md5, genre_id, hit_length, language_id, last_update, max_combo, mode, passcount, playcount, rating, source, storyboard, submit_date, tags, title, total_length, version, video
        } = data
        this.id = parseInt(beatmap_id)
        this.SetId = parseInt(beatmapset_id)
        this.Artist = artist
        this.Source = source
        this.Version = version
        this.Title = title
        this.Mapper = creator
        this.Difficulty = {
            Aim: parseFloat(diff_aim),
            Approach: parseFloat(diff_approach),
            CircleSize: parseFloat(diff_size),
            HealthDrain: parseFloat(diff_drain),
            Overall: parseFloat(diff_overall),
            Speed: parseFloat(diff_speed),
            Star: parseFloat(difficultyrating)
        }
        this.Objects = {
            Circles: parseInt(count_normal),
            Sliders: parseInt(count_slider),
            Spinners: parseInt(count_spinner)
        }
        this.Combo = parseInt(max_combo)
        this.Mode = parseInt(mode) as 0 | 1 | 2 | 3
        this.Genre = parseInt(genre_id)
        this.Language = parseInt(language_id)
        this.Tags = tags
        this.HasStoryBoard = storyboard == "1"
        this.HasAudio = audio_unavailable == "0"
        this.Downloadable = download_unavailable == "0"
        this.HasVideo = video == "1"
        this.FavouritedCount = parseInt(favourite_count)
        this.Rating = parseInt(rating)
        this.Playcount = parseInt(playcount)
        this.PassCount = parseInt(passcount)
        this.MapperId = parseInt(creator_id)
        this.Bpm = parseInt(bpm)
        this.Length = { Total: parseInt(total_length), Drain: parseInt(hit_length) }
        this.Approved = this.MapRanking[approved]
        this.ApprovedDate = new Date(approved_date)
        this.SubmitedDate = new Date(submit_date)
        this.LastUpdate = new Date(last_update)
        this.ApprovedRaw = parseInt(approved)
        this.Hash = file_md5
    }
    private LoadFormattedData () {
        this.Formatted = {
            Difficulty: {
                Aim: RoundFixed(this.Difficulty.Aim, 2),
                Speed: RoundFixed(this.Difficulty.Speed, 2),
                Star: RoundFixed(this.Difficulty.Star),
                Approach: this.Difficulty.Approach.toFixed(2),
                CircleSize: this.Difficulty.CircleSize.toFixed(2),
                HealthDrain: this.Difficulty.HealthDrain.toFixed(2),
                Overall: this.Difficulty.Overall.toFixed(2)
            },
            Length: {
                Total: `${ZeroFill(Math.floor(this.Length.Total / 60))}:${ZeroFill(this.Length.Total % 60)}`,
                Drain: `${ZeroFill(Math.floor(this.Length.Drain / 60))}:${ZeroFill(this.Length.Drain % 60)}`
            }
        }
    }
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