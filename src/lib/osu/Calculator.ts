import axios from "axios"
import { Message } from "discord.js"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { diff, parser, ppv2, std_accuracy } from "ojsama"
import { DeepCopy } from "../../GlobalUtils"
import { Counts, Difficulty, Performance, Score } from "../../interfaces/OsuApi"
import { Bot } from "../../bot/client/Client"
import { RoundFixed } from "./Utils"
const CACHE_DIR = "./src/cache"

if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR)

export const GetPlayPerformance = (client: Bot, message: Message, score: Score, mode: 0 | 1 | 2 | 3): Promise<Performance> => {
    switch (mode) {
        case 0: return CalcStdPerformance(client, message, score)

        default:
            break
    }
}

export const GetAccuracyPerformance = (client: Bot, message: Message, mapId: number, mods: number, mode: 0 | 1 | 2 | 3, acc: number[] | number): Promise<Performance[]> => {
    switch (mode) {
        case 0: return CalcStdAccuracyPerformance(client, message, mapId, mods, acc)

        default:
            break
    }
}

export const GetFcPerformance = (client: Bot, message: Message, score: Score, mode: 0 | 1 | 2 | 3): Promise<Performance> => {
    score = DeepCopy(score)
    score.Counts[300] += score.Counts.miss
    score.Counts.miss = 0
    score.Combo = 0

    return GetPlayPerformance(client, message, score, mode)
}

export const GetDiffWithMods = async (client: Bot, message: Message, mapId: number, mode: 0 | 1 | 2 | 3, mods: number | number[]) => {
    if (typeof mods == "number") mods = [mods]
    switch (mode) {
        case 0: return await CaclStdDiffWithMods(client, message, mapId, mods)

        default:
            break
    }
}

export const GetFcAccuracy = (client: Bot, message: Message, counts: Counts, mode: 0 | 1 | 2 | 3) => {
    let acc: number
    switch (mode) {
        case 0:
            acc = new std_accuracy({
                n300: counts[300] + counts.miss,
                n100: counts[100],
                n50: counts[50],
                nmiss: 0
            }).value()
            return RoundFixed(acc * 100)
        default:
    }
}

const CalcStdPerformance = async (client: Bot, message: Message, score: Score): Promise<Performance> => {
    const mapFile = await GetBeatmapFile(client, message, score.MapId)
    const mapParser = new parser().feed(mapFile)
    const data = {
        map: mapParser.map,
        mods: score.Mods,
        n300: score.Counts[300],
        n100: score.Counts[100],
        n50: score.Counts[50],
        nmiss: score.Counts.miss,
        combo: score.Combo || mapParser.map.max_combo()
    }
    
    const performance = ppv2(data)
    return {
        Accuracy: {
            raw: performance.acc,
            Formatted: RoundFixed(performance.acc)
        },
        Aim: {
            raw: performance.aim,
            Formatted: RoundFixed(performance.aim)
        },
        Speed: {
            raw: performance.speed,
            Formatted: RoundFixed(performance.speed)
        },
        Total: {
            raw: performance.total,
            Formatted: RoundFixed(performance.total)
        },
        AccuracyPercent: {
            raw: performance.computed_accuracy.percent,
            Formatted: RoundFixed(performance.computed_accuracy.percent)
        }
    }
}

const CalcStdAccuracyPerformance = async (client: Bot, message: Message, mapId: number, mods: number, acc: number | number[]): Promise<Performance[]> => {
    if (typeof acc == "number") acc = [acc]
    const mapFile = await GetBeatmapFile(client, message, mapId)
    const mapParser = new parser().feed(mapFile)
    const data = {
        map: mapParser.map,
        mods: mods,
        acc_percent: 100
    }
    const out: Performance[] = []
    acc.forEach(el => {
        data.acc_percent = el
        const performance = ppv2(data)
        out.push({
            Accuracy: {
                raw: performance.acc,
                Formatted: RoundFixed(performance.acc)
            },
            Aim: {
                raw: performance.aim,
                Formatted: RoundFixed(performance.aim)
            },
            Speed: {
                raw: performance.speed,
                Formatted: RoundFixed(performance.speed)
            },
            Total: {
                raw: performance.total,
                Formatted: RoundFixed(performance.total)
            },
            AccuracyPercent: {
                raw: el,
                Formatted: el.toString()
            }
        })
    })
    return out
}

const CaclStdDiffWithMods = async (client: Bot, message: Message, mapId: number, mods: number[]) => {
    const mapFile = await GetBeatmapFile(client, message, mapId)
    const mapParser = new parser().feed(mapFile)
    const data = {
        map: mapParser.map,
        mods: 0
    }
    const out: Difficulty[] = []
    mods.forEach(el => {
        data.mods = el
        const difficulty = new diff().calc(data)
        out.push({
            Aim: {
                raw: difficulty.aim,
                Formatted: RoundFixed(difficulty.aim)
            },
            Speed: {
                raw: difficulty.speed,
                Formatted: RoundFixed(difficulty.speed)
            },
            Total: {
                raw: difficulty.total,
                Formatted: RoundFixed(difficulty.total)
            }
        })
    })
    return out
}

const GetBeatmapFile = async (client: Bot, message: Message, id: number): Promise<string> => {
    if (existsSync(`${CACHE_DIR}/${id}.osu`)) return readFileSync(`${CACHE_DIR}/${id}.osu`).toString("utf-8")
    const mapFile = await axios.get(`http://osu.ppy.sh/osu/${id}`)
    
    writeFileSync(`${CACHE_DIR}/${id}.osu`, mapFile.data)

    return mapFile.data
}


// import { Bot } from "../client/Client"
// import { CalculateAcc, Mods, RoundFixed } from "./Utils"
// import { diff, ppv2, std_diff } from "ojsama"
// import { DeepCopy } from "../../shared/GlobalUtils"
// import { Beatmap, Counts, Score } from "../../shared/interfaces/OsuApi"

// export const GetPP = (client: Bot, score: Score, beatmap: Beatmap, mode: number) => {
//     switch (mode) {
//         case 0:
//             return StdPP(client, score, beatmap)
//         case 1:
//             return TaikoPP(client, score, beatmap)
//         case 2:
//             return CtbPP(client, score, beatmap)

//         default:
//             break;
//     }
// }

// export const GetMapPP = (client: Bot, beatmap: Beatmap, mode: number, acc: number) => {
//     switch (mode) {
//         case 0:
//             return StdMapPP(client, beatmap, acc)
//         case 1:
//             return "Not Implemented"
//             //return TaikoMapPP(client, beatmap)
//         case 2:
//             return "Not Implemented"
//             //return CtbMapPP(client, beatmap)

//         default:
//             break;
//     }
// }

// export const GetFcAcc = (client: Bot, score: Score, mode: number) => {
//     let counts: Counts = Object.create(score.Counts)
//     counts[300] += counts.miss
//     counts.miss = 0
//     switch (mode) {
//         case 3:
//         case 1:
//         case 0:
//             return CalculateAcc(client, counts, mode)
//         case 2:
//             counts[300] += counts.katu
//             counts.katu = 0
//             return CalculateAcc(client, counts, mode)
//         default:
//             client.logger.error(`Unknown gamemode ${mode}`)
//             return "Unknown"
//     }
// }

// export const GetFcPP = (client: Bot, score: Score, beatmap: Beatmap, mode: number) => {
//     score = DeepCopy(score)
//     score.Counts[300] += score.Counts.miss
//     score.Counts.miss = 0
//     switch (mode) {
//         case 0:
//             score.Combo = beatmap.MaxCombo
//             return StdPP(client, score, beatmap)
//         case 1:
//             score.Combo = beatmap.MaxCombo
//             return TaikoPP(client, score, beatmap)
//         case 2:
//             score.Combo = beatmap.MaxCombo
//             return CtbPP(client, score, beatmap)
//     }
// }

// export const DiffWithMods = (client: Bot, beatmap: Beatmap, mode: number, mods: number) => {
//     switch (mode) {
//         case 0:
//             return new diff().calc({map: ConvertMap(client, beatmap)})
//         case 1:
//         case 2:
//         default: return 1
//     }
// }


// const StdPP = (client: Bot, score: Score, beatmap: Beatmap) => {
//     return RoundFixed(ppv2({
//         acc_percent: parseFloat(CalculateAcc(client, score.Counts, 0)),
//         aim_stars: beatmap.Difficulty.Aim.raw,
//         base_ar: beatmap.Difficulty.Approach.raw,
//         base_od: beatmap.Difficulty.Overall.raw,
//         combo: score.Combo,
//         max_combo: beatmap.MaxCombo,
//         mods: score.Mods,
//         n300: score.Counts[300],
//         n100: score.Counts[100],
//         n50: score.Counts[50],
//         nmiss: score.Counts.miss,
//         ncircles: beatmap.Objects.Circle,
//         nsliders: beatmap.Objects.Slider,
//         nobjects: beatmap.Objects.Circle + beatmap.Objects.Slider + beatmap.Objects.Spinner,
//         score_version: 1,
//         speed_stars: beatmap.Difficulty.Speed.raw,
//     }).total)
// }

// const StdMapPP = (client: Bot, beatmap: Beatmap, acc: number) => {
//     return RoundFixed(ppv2({
//         acc_percent: acc,
//         aim_stars: beatmap.Difficulty.Aim.raw,
//         base_ar: beatmap.Difficulty.Approach.raw,
//         base_od: beatmap.Difficulty.Overall.raw,
//         combo: beatmap.MaxCombo,
//         max_combo: beatmap.MaxCombo,
//         nmiss: 0,
//         ncircles: beatmap.Objects.Circle,
//         nsliders: beatmap.Objects.Slider,
//         nobjects: beatmap.Objects.Circle + beatmap.Objects.Slider + beatmap.Objects.Spinner,
//         score_version: 1,
//         speed_stars: beatmap.Difficulty.Speed.raw,
//     }).total)
// }

// const TaikoPP = (client: Bot, score: Score, beatmap: Beatmap) => {
//     let multiplier: number = 1.1

//     if (score.Mods & Mods.Bit.NoFail)
//         multiplier *= 0.9

//     if (score.Mods & Mods.Bit.Hidden)
//         multiplier *= 1.1

//     let strain = TaikoStrain(client, score, beatmap)
//     let acc = TaikoAcc(client, score, beatmap)
//     let total = Math.pow(
//         Math.pow(strain, 1.1) +
//         Math.pow(acc, 1.1), 1 / 1.1
//     ) * multiplier

//     return RoundFixed(total)
// }

// const TaikoStrain = (client: Bot, score: Score, beatmap: Beatmap): number => {
//     let strain = Math.pow(Math.max(1, beatmap.Difficulty.Star.raw / 0.0075) * 5 - 4, 2) / 100000

//     let lengthBonus = Math.min(1, beatmap.MaxCombo / 1500) * 0.1 + 1

//     strain *= lengthBonus

//     strain *= Math.pow(0.985, score.Counts.miss)

//     if (score.Mods & Mods.Bit.Hidden)
//         strain *= 1.025

//     if (score.Mods & Mods.Bit.Flashlight)
//         strain *= 1.05 * lengthBonus

//     strain *= Math.min(Math.pow(beatmap.MaxCombo - score.Counts.miss, 0.5) / Math.pow(beatmap.MaxCombo, 0.5), 1)
//     strain *= (1 - score.Counts.miss / beatmap.MaxCombo - score.Counts[100] / 2 / beatmap.MaxCombo)
//     return strain
// }

// const TaikoAcc = (client: Bot, score: Score, beatmap: Beatmap): number => {
//     let accValue = Math.pow(150 / GetHitWindow(client, beatmap.Difficulty.Overall.raw, score), 1.1) * Math.pow((1 - score.Counts.miss / beatmap.MaxCombo - score.Counts[100] / 2 / beatmap.MaxCombo), 15) * 22

//     accValue *= Math.min(Math.pow(beatmap.MaxCombo / 1500, 0.3), 1.15)

//     return accValue
// }

// const GetHitWindow = (client: Bot, od: number, score: Score) => {
//     let max = 20
//     let min = 50
//     let result = min + (max - min) * od / 10
//     result = Math.floor(result) - 0.5

//     if (score.Mods & Mods.Bit.HalfTime)
//         result /= 0.75

//     if (score.Mods & Mods.Bit.DoubleTime)
//         result /= 1.5

//     return Math.round(result * 100) / 100;
// }


// const CtbPP = (client: Bot, score: Score, beatmap: Beatmap) => {
//     let _value = Math.pow(5 * Math.max(1, beatmap.Difficulty.Star.raw / 0.0049) - 4, 2) / 100000

//     let numTotalHits = score.Counts[300] + score.Counts[100] + score.Counts.miss
//     let numTotalSuccessfulHits = score.Counts[300] + score.Counts[100] + score.Counts[50]
//     let tHits = score.Counts[50] + score.Counts[100] + score.Counts[300] + score.Counts.miss + score.Counts.katu

//     let lengthBonus = 0.95 + 0.3 * Math.min(1, numTotalHits / 2500) +
//         (numTotalHits > 2500 ? Math.log10(numTotalHits / 2500) * 0.475 : 0)


//     _value *= lengthBonus

//     _value *= Math.pow(0.97, score.Counts.miss)

//     let beatmapMaxCombo = beatmap.MaxCombo
//     if (beatmapMaxCombo > 0)
//         _value *= Math.min(Math.pow(score.Combo, 0.8) / Math.pow(beatmapMaxCombo, 0.8), 1)

//     let approachRate = beatmap.Difficulty.Approach.raw
//     let approachRateFactor = 1
//     if (approachRate > 9)
//         approachRateFactor += 0.1 * (approachRate - 9)
//     if (approachRate > 10)
//         approachRateFactor += 0.1 * (approachRate - 10)
//     else if (approachRate < 8)
//         approachRateFactor += 0.025 * (8 - approachRate)

//     _value *= approachRateFactor

//     if (score.Mods & Mods.Bit.Hidden) {
//         if (approachRate <= 10)
//             _value *= 1.05 + 0.075 * (10 - approachRate)
//         else if (approachRate > 10)
//             _value *= 1.01 + 0.04 * (11 - Math.min(11, approachRate))
//     }

//     if (score.Mods & Mods.Bit.Flashlight)
//     _value *= 1.35 * lengthBonus

//     _value *= Math.pow(numTotalSuccessfulHits/tHits, 5.5)

//     if (score.Mods & Mods.Bit.NoFail)
//     _value *= 0.90

//     if (score.Mods & Mods.Bit.SpunOut)
//     _value *= 0.95

//     return RoundFixed(_value)
// }

// const ConvetMap = (client: Bot, beatmap: Beatmap) => {
//     new diff().map
// }