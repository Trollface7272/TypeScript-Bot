import axios from "axios"
import { url } from "./Constants"
import { iProfileParams, iProfileRaw } from "./interfaces/Profile"

export class OsuProfile {
    public id: number
    public Name: string
    public Registered: Date
    public Country: string
    public PlayCount: number
    public Level: number
    public Performance: number
    public Rank: { Country: number, Global: number }
    public Accuracy: number
    public Playtime: number
    public Hitcounts: { "300": number, "100": number, "50": number }
    public Ranks: { X: number, XH: number, S: number, SH: number, A: number }
    public Score: { Total: number, Ranked: number }

    public Formatted: {
        Registered: string, PlayCount: string, Level: string, Performence: string,
        Accuracy: string, Playtime: string,
        Hitcounts: { "300": string, "100": string, "50": string }
        Ranks: { X: string, XH: string, S: string, SH: string, A: string },
        Rank: { Country: string, Global: string },
        Score: { Total: string, Ranked: string },

    }

    private endPoint = url + "get_user"
    constructor(params?: iProfileParams) {
        if (params) this.Load(params)
    }

    public async Load (params: iProfileParams) {
        const data = (await axios.get(this.endPoint, { params })).data[0]
        if (!data) throw { code: 3, description: "User not found!" }
        this.LoadData(data)
        this.FormatData()
    }

    private FormatData() {
        this.Formatted = {
            Accuracy: `${Math.floor(this.Accuracy)} (${Math.floor(this.Accuracy) })`
        }
    }
    private LoadData (data: iProfileRaw) {
        const { accuracy, count100, count300, count50, count_rank_a, count_rank_s, count_rank_sh, count_rank_ss, count_rank_ssh, country, events, join_date, level, playcount, pp_country_rank, pp_rank, pp_raw, ranked_score, total_score, total_seconds_played, user_id, username }: iProfileRaw = data
        this.id = parseInt(user_id)
        this.Name = username
        this.Registered = new Date(join_date)
        this.Country = country
        this.PlayCount = parseInt(playcount)
        this.Level = parseFloat(user_id)
        this.Performance = parseInt(pp_raw)
        this.Rank = { Country: parseInt(pp_country_rank), Global: parseInt(pp_rank) }
        this.Accuracy = parseFloat(accuracy)
        this.Playtime = parseInt(total_seconds_played)
        this.Hitcounts = { "300": parseInt(count300), "100": parseInt(count100), "50": parseInt(count50) }
        this.Score = { Ranked: parseInt(ranked_score), Total: parseInt(total_score) }
        this.Ranks = { A: parseInt(count_rank_a), S: parseInt(count_rank_s), SH: parseInt(count_rank_sh), X: parseInt(count_rank_ss), XH: parseInt(count_rank_ssh) }
    }
}