export const key: string = process.env.OSU_KEY
export const linkBase = "https://osu.ppy.sh/"

import { Get as ApiGetBeatmap, GetShort as ApiGetIncompleteBeatmap } from "./Beatmap"
import { Get as ApiGetProfile, GetCached as ApiGetProfileCached } from "./Profile"
import { Get as ApiGetRecent } from "./Recent"
import { Get as ApiGetScore } from "./Score"
import { Get as ApiGetTop } from "./Top"
import { Beatmap, BeatmapParams, Profile, ProfileParams, RecentParams, Score, ScoreParams, ShortBeatmap, TopParams } from "../../../interfaces/OsuApi"

export const GetBeatmap = (params: BeatmapParams): Promise<Beatmap> => {
    params.k = key
    return ApiGetBeatmap(params)
}

export const GetIncompleteBeatmap = (params: BeatmapParams): Promise<ShortBeatmap> => {
    return ApiGetIncompleteBeatmap(params)
}

export const GetProfile = (params: ProfileParams): Promise<Profile> => {
    params.k = key
    return ApiGetProfile(params)
}

export const GetProfileCache = (params: ProfileParams): Promise<Profile> => {
    params.k = key
    return ApiGetProfileCached(params)
}

export const GetRecent = (params: RecentParams): Promise<Array<Score>> => {
    params.k = key
    return ApiGetRecent(params)
}

export const GetScore = (params: ScoreParams): Promise<Array<Score>> => {
    params.k = key
    return ApiGetScore(params)
}

export const GetTop = (params: TopParams): Promise<Array<Score>> => {
    params.k = key
    return ApiGetTop(params)
}