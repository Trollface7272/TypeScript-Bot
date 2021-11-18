import axios from "axios"
import { osuApiKey, url } from "../Constants"
import { iBeatmapDifficulty, iBeatmapDifficultyFormatted, iBeatmapObjects, iBeatmapParams, iBeatmapRaw } from "../interfaces/Beatmap"



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
    public Dificulty: iBeatmapDifficulty
    public Objects: iBeatmapObjects
    public Length
    public Approved
    public SubmitedDate
    public LastUpdate
    public Hash
    public Combo: number
    public Mode: 0 | 1 | 2 | 3

    public Formatted: {
        Difficulty: iBeatmapDifficultyFormatted
    }

    public async Load (params: iBeatmapParams) {
        if (!params.k) params.k = osuApiKey

        const data: iBeatmapRaw = (await axios.get(this.endPoint, { params })).data[0]
        this.LoadData(data)
    }

    public LoadData (data: iBeatmapRaw) {
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
        this.Dificulty = {
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
        this.HasStoryBoard = !!storyboard
        this.HasAudio = !audio_unavailable
        this.Downloadable = !download_unavailable
        this.HasVideo = !!video
        this.FavouritedCount = parseInt(favourite_count)
        this.Rating = parseInt(rating)
        this.Playcount = parseInt(playcount)
        this.PassCount = parseInt(passcount)
        this.MapperId = parseInt(creator_id)
        this.Bpm = parseInt(bpm)
        this.Length = { Total: parseInt(total_length), Drain: parseInt(hit_length) }
        this.Approved = this.MapRanking[approved]
    }
}