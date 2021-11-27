import { DeepCopy } from "@lib/GlobalUtils"
import axios from "axios"
import { Calculator } from "../Calculator"
import { osuApiKey, url } from "../Constants"
import { CommaFormat, RoundFixed } from "../Functions"
import { iRecentParams, iScoreHitcounts, iScoreParams, iScoreRaw, iTopParams } from "../interfaces/Score"
import { OsuBeatmap } from "./Beatmap"



export class Score {
    public Index: number
    public UserId: number
    public Username: string
    public MapId: number
    public Score: number
    public Counts: iScoreHitcounts
    public Combo: number
    public Perfect: boolean
    public Mods: number
    public Date: Date
    public Rank: string
    public Performance: number
    public Downloadable: boolean
    public FcPerformance: number
    public Beatmap: OsuBeatmap

    public get Accuracy() {
        return (((this.Counts[300] * 300 + this.Counts[100] * 100 + this.Counts[50] * 50) / ((this.Counts[300] + this.Counts[100] + this.Counts[50] + this.Counts.miss) * 300) * 10000) / 100)
    }
    public get FcAccuracy() {
        return ((((this.Counts[300] + this.Counts.miss) * 300 + this.Counts[100] * 100 + this.Counts[50] * 50) / ((this.Counts[300] + this.Counts[100] + this.Counts[50] + this.Counts.miss) * 300) * 10000) / 100)
    }

    public Formatted: {
        Performance: string,
        Score: string
    }

    constructor(play: iScoreRaw, index: number) {
        this.Index = index
        this.UserId = parseInt(play.user_id)
        this.Username = null
        this.MapId = parseInt(play.beatmap_id)
        this.Score = parseInt(play.score)

        this.Counts = {
            '300': parseInt(play.count300),
            '100': parseInt(play.count100),
            '50': parseInt(play.count50),
            katu: parseInt(play.countkatu),
            geki: parseInt(play.countgeki),
            miss: parseInt(play.countmiss)
        }
        this.Combo = parseInt(play.maxcombo)
        this.Perfect = play.perfect == '1'
        this.Mods = parseInt(play.enabled_mods)
        this.Date = new Date(play.date)
        this.Rank = play.rank
        this.Performance = parseFloat(play.pp)

        this.Downloadable = false

        this.Formatted = {
            Performance: CommaFormat(RoundFixed(this.Performance)),
            Score: CommaFormat(this.Score)
        }
    }

    public async CalculateFcPerformance() {
        if (!this.Beatmap) await this.FetchMap()
        const score: Score = DeepCopy(this)
        score.Counts[300] += score.Counts.miss
        score.Counts.miss = 0
        score.Combo = this.Beatmap.Combo

        if (!this.Perfect) this.FcPerformance = new Calculator(score).Total
        if (!this.Performance) {
            this.Performance = new Calculator(this).Total
            this.Formatted.Performance = CommaFormat(RoundFixed(this.Performance))
        }
    }

    public async FetchMap() {
        this.Beatmap = await new OsuBeatmap().Load({ b: this.MapId, mods: this.Mods })
    }
}

export class OsuScore {
    public Scores: Score[]
    private RecentEndpoint = url + "get_user_recent"
    private TopEndpoint = url + "get_user_best"
    private ScoreEndpoint = url + "get_scores"
    public async Recent(params: iRecentParams) {
        if (!params.k) params.k = osuApiKey
        this.Scores = []
        const data: iScoreRaw[] = (await axios.get(this.RecentEndpoint, { params })).data
        if (!data || data.length == 0) throw { code: 5 }
        await this.LoadData(data)
        return this
    }

    public async Score(params: iScoreParams) {
        if (!params.k) params.k = osuApiKey
        this.Scores = []
        const data: iScoreRaw[] = (await axios.get(this.ScoreEndpoint, { params })).data
        if (!data || data.length == 0) throw { code: 7 }
        await this.LoadData(data)
        return this
    }

    public async Top(params: iTopParams) {
        if (!params.k) params.k = osuApiKey
        this.Scores = []
        const data: iScoreRaw[] = (await axios.get(this.TopEndpoint, { params })).data
        if (!data || data.length == 0) throw { code: 5 }
        await this.LoadData(data)
        return this
    }

    public async FetchBeatmaps(from=0, to: number=this.Scores.length) {
        for (let i = from; i < Math.min(to, this.Scores.length); i++) {
            await this.Scores[i].FetchMap()
        }
    }

    public async CalculateFcPerformance(from=0, to: number=this.Scores.length) {
        for (let i = from; i < Math.min(to, this.Scores.length); i++) {
            await this.Scores[i].CalculateFcPerformance()
        }
    }


    private async LoadData(data: iScoreRaw[]) {
        for (let i = 0; i < data.length; i++) {
            const score = data[i]
            if (score.perfect == null) score.perfect = "false"
            if (score.pp == null) score.pp = "0"
            this.Scores[i] = new Score(score, i + 1)
        }
    }

}