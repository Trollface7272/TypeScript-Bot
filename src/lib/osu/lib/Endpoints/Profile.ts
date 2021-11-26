import axios from "axios"
import { CommaFormat, RoundFixed } from "../Functions"
import { osuApiKey, url } from "../Constants"
import { iProfileFormatted, iProfileHitcounts, iProfileParams, iProfileRank, iProfileRanks, iProfileRaw, iProfileScore } from "../interfaces/Profile"
import { AddToCache, GetCached } from "../cache/Profile"

export class OsuProfile {
    public id: number
    public Name: string
    public Registered: Date
    public Country: string
    public PlayCount: number
    public Level: number
    public Performance: number
    public Rank: iProfileRank
    public Accuracy: number
    public Playtime: number
    public Hitcounts: iProfileHitcounts
    public Ranks: iProfileRanks
    public Score: iProfileScore
    public Formatted: iProfileFormatted

    private endPoint = url + "get_user"

    public async Load ({ u, type, event_days, k, m, useCache }: iProfileParams) {
        let profile: OsuProfile
        if (useCache) profile = GetCached(u)
        if (profile) return this.LoadFromSelf(profile)

        if (!k) k = osuApiKey

        const data = (await axios.get(this.endPoint, { params: { u, type, event_days, k, m } })).data[0]
        if (!data) throw { code: 4, description: "User not found!" }
        this.LoadData(data)
        this.FormatData()
        AddToCache(this)
        return this
    }
    public LoadFromSelf (self: OsuProfile) {
        this.Name = self.Name
        this.Registered = self.Registered
        this.Country = self.Country
        this.PlayCount = self.PlayCount
        this.Level = self.Level
        this.Performance = self.Performance
        this.Rank = { Country: self.Rank.Country, Global: self.Rank.Global }
        this.Accuracy = self.Accuracy
        this.Playtime = self.Playtime
        this.Hitcounts = { "100": self.Hitcounts[100], "300": self.Hitcounts[300], "50": self.Hitcounts[50] }
        this.Ranks = { A: self.Ranks.A, S: self.Ranks.S, SH: self.Ranks.SH, X: self.Ranks.X, XH: self.Ranks.XH }
        this.Score = { Ranked: self.Score.Ranked, Total: self.Score.Total }
        this.FormatData()
        return this
    }

    private FormatData () {
        this.Formatted = {
            Accuracy: this.Accuracy.toFixed(2),
            Hitcounts: { "300": this.Hitcounts[300].toString(), "100": this.Hitcounts[100].toString(), "50": this.Hitcounts[50].toString() },
            Level: `${Math.floor(this.Level)} (${((this.Level - Math.floor(this.Level)) * 100).toFixed(2)}%)`,
            Performence: CommaFormat(RoundFixed(this.Performance)),
            PlayCount: CommaFormat(this.PlayCount),
            Playtime: this.Playtime.toString(),
            Rank: { Country: CommaFormat(this.Rank.Country), Global: CommaFormat(this.Rank.Global) },
            Ranks: { A: this.Ranks.A.toString(), S: this.Ranks.S.toString(), SH: this.Ranks.SH.toString(), X: this.Ranks.X.toString(), XH: this.Ranks.XH.toString() },
            Registered: this.Registered.toDateString(),
            Score: { Ranked: CommaFormat(this.Score.Ranked), Total: CommaFormat(this.Score.Total) }
        }
    }
    private LoadData (data: iProfileRaw) {
        const { accuracy, count100, count300, count50, count_rank_a, count_rank_s, count_rank_sh, count_rank_ss, count_rank_ssh, country, join_date, level, playcount, pp_country_rank, pp_rank, pp_raw, ranked_score, total_score, total_seconds_played, user_id, username }: iProfileRaw = data
        this.id = parseInt(user_id)
        this.Name = username
        this.Registered = new Date(join_date)
        this.Country = country
        this.PlayCount = parseInt(playcount)
        this.Level = parseFloat(level)
        this.Performance = parseFloat(pp_raw)
        this.Rank = { Country: parseInt(pp_country_rank), Global: parseInt(pp_rank) }
        this.Accuracy = parseFloat(accuracy)
        this.Playtime = parseInt(total_seconds_played)
        this.Hitcounts = { "300": parseInt(count300), "100": parseInt(count100), "50": parseInt(count50) }
        this.Score = { Ranked: parseInt(ranked_score), Total: parseInt(total_score) }
        this.Ranks = { A: parseInt(count_rank_a), S: parseInt(count_rank_s), SH: parseInt(count_rank_sh), X: parseInt(count_rank_ss), XH: parseInt(count_rank_ssh) }
    }
}