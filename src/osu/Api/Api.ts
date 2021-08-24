import { Config } from "../../interfaces/Config"
import * as File from "../../../config.json"
export const key: string = (File as Config).osu_token
export const linkBase: string = "https://osu.ppy.sh/"

import { Get as ApiGetBeatmap, GetShort as ApiGetIncompleteBeatmap } from "./Beatmap"
import { Get as ApiGetProfile } from "./Profile"
import { Get as ApiGetRecent } from "./Recent"
import { Get as ApiGetScore } from "./Score"
import { Get as ApiGetTop } from "./Top"
import { Beatmap, BeatmapParams, Profile, ProfileParams, RecentParams, Score, ScoreParams, ShortBeatmap, TopParams } from "../../interfaces/OsuApi"

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
    return ApiGetProfile(params)
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