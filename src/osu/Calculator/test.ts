import { beatmap, parser, ppv2, std_diff } from "ojsama"
import { Beatmap, Counts, Score } from "../Api/Api"
import { Get as GetBeatmap } from "../Api/Beatmap"
import { Get as GetTop } from "../Api/Top"
import { Mods } from "../Utils"
import consola, { Consola, LogLevel } from "consola"
import axios from "axios"

let logger: Consola = consola

function TotalHits(counts: Counts) {
    return counts[50] + counts[100] + counts[300] + counts.miss
}

function Clamp(num: number, min: number, max: number) {
    return Math.min(Math.max(num, min), max)
}

function Accuracy(counts: Counts) {
    return Clamp(counts[50] * 50 + counts[100] * 100 + counts[300] * 300 / (TotalHits(counts) * 300), 0, 1)
}

function TotalValue(score: Score, beatmap: Beatmap) {
    let objects = beatmap.Objects
    let counts = score.Counts
    let mods = score.Mods
    let multiplier = 1.12

    if (mods & Mods.Bit.NoFail)
        multiplier *= Math.max(0.9, 1 - 0.02 * counts.miss)

    let numTotalHits = TotalHits(counts)

    if ((mods & Mods.Bit.SpunOut) > 0)
        multiplier *= 1 - Math.pow(objects.Spinner / numTotalHits, 0.85)

    return Math.pow(
        Math.pow(Aim(score, beatmap), 1.1) +
        Math.pow(Speed(score, beatmap), 1.1) +
        Math.pow(Acc(score, beatmap), 1.1), 1 / 1.1
    ) * multiplier
}

function Aim(score: Score, beatmap: Beatmap) {
    let difficulty = beatmap.Difficulty
    let counts = score.Counts
    let mods = score.Mods
    let rawAim = difficulty.Aim.raw

    if (mods & Mods.Bit.TouchDevice)
        rawAim = Math.pow(rawAim, 0.8)

    let _aimValue = Math.pow(5 * Math.max(1, rawAim / 0.0675) - 4, 3) / 100000

    let numTotalHits = TotalHits(counts)

    let LengthBonus = 0.95 + 0.4 * Math.min(1, numTotalHits / 2000) +
        (numTotalHits > 2000 ? Math.log10(numTotalHits) / 2000 * 0.5 : 0)

    _aimValue *= LengthBonus

    if (counts.miss > 0)
        _aimValue *= 0.97 * Math.pow(1 - Math.pow(counts.miss / numTotalHits, 0.775), counts.miss)

    let combo = score.Combo
    let maxCombo = beatmap.MaxCombo
    if (combo > 0)
        _aimValue *= Math.min(Math.pow(maxCombo, 0.8) / Math.pow(combo, 0.8), 1)

    let approachRate = beatmap.Difficulty.Approach.raw
    let approachRateFactor = 0.0
    if (approachRate > 10.33)
        approachRateFactor = approachRate - 10.33
    else if (approachRate < 8)
        approachRateFactor = 0.025 * (8 - approachRate)

    let approachRateTotalHitsFactor = 1 / (1 + Math.exp(-(0.007 * (numTotalHits) - 400)))

    let approachRateBonus = 1 + (0.03 + 0.37 * approachRateTotalHitsFactor) * approachRateFactor

    if (mods & Mods.Bit.Hidden)
        _aimValue *= 1 + 0.04 * (12 - approachRate)

    let flashlightBonus = 1
    if (mods & Mods.Bit.Flashlight)
        flashlightBonus = 1 + 0.35 * Math.min(1, numTotalHits / 200) +
            (numTotalHits > 200 ? 0.3 * Math.min(1, numTotalHits - 200 / 300) +
                (numTotalHits > 500 ? numTotalHits - 500 / 1200 : 0)
                : 0)

    _aimValue *= Math.max(flashlightBonus, approachRateBonus)

    _aimValue *= 0.5 + Accuracy(counts) / 2

    _aimValue *= 0.98 + (Math.pow(difficulty.Overall.raw, 2) / 2500)

    logger.debug("Aim value: " + _aimValue)
    return _aimValue
}

function Speed(score: Score, beatmap: Beatmap) {
    let difficulty = beatmap.Difficulty
    let counts = score.Counts
    let mods = score.Mods
    let rawSpeed = difficulty.Speed.raw

    let _speedValue = Math.pow(5 * Math.max(1, rawSpeed / 0.0675) - 4, 3) / 100000

    let numTotalHits = TotalHits(counts)

    let lengthBonus = 0.95 + 0.4 * Math.min(1, numTotalHits / 2000) +
        (numTotalHits > 2000 ? Math.log10(numTotalHits / 2000) * 0.5 : 0)
    _speedValue *= lengthBonus

    if (counts.miss > 0)
        _speedValue *= 0.97 * Math.pow(1 - Math.pow(counts.miss / numTotalHits, 0.775), Math.pow(counts.miss, 0.875))

    let maxCombo = beatmap.MaxCombo
    let combo = score.Combo

    if (maxCombo > 0)
        _speedValue *= Math.min(Math.pow(combo, 0.8) / Math.pow(maxCombo, 0.8), 1);

    let approachRate = difficulty.Approach.raw
    let approachRateFactor = 0
    if (approachRate > 10.33)
        approachRateFactor = approachRate - 10.33

    let approachRateTotalHitsFactor = 1 / (1 + Math.exp(-(0.007 * (numTotalHits - 400))))

    _speedValue *= 1 + (0.03 + 0.37 * approachRateTotalHitsFactor) * approachRateFactor

    if (mods & Mods.Bit.Hidden)
        _speedValue *= 1 + 0.04 * (12 - approachRate)

    _speedValue *= (0.95 + Math.pow(difficulty.Overall.raw, 2) / 750) * Math.pow(Accuracy(counts), (14.5 - Math.max(difficulty.Overall.raw, 8)) / 2)

    _speedValue *= Math.pow(0.98, counts[50] < numTotalHits / 500 ? 0 : counts[50] - numTotalHits / 500)

    logger.debug("Speed value: " + _speedValue)
    return _speedValue
}

function Acc(score: Score, beatmap: Beatmap) {
    let difficulty = beatmap.Difficulty
    let counts = score.Counts
    let mods = score.Mods
    let objects = beatmap.Objects
    let betterAccuracyPercentage: number

    let numHitObjectsWithAccuracy = objects.Circle
    if (numHitObjectsWithAccuracy > 0)
        betterAccuracyPercentage = ((counts[300] - (TotalHits(counts) - numHitObjectsWithAccuracy)) * 6 + counts[100] * 2 + counts[50]) / (numHitObjectsWithAccuracy * 6)
    else
        betterAccuracyPercentage = 0

    if (betterAccuracyPercentage < 0)
        betterAccuracyPercentage = 0

    let _accValue =
        Math.pow(1.52163, difficulty.Overall.raw) * Math.pow(betterAccuracyPercentage, 24) * 2.83

    _accValue *= Math.min(1.15, Math.pow(numHitObjectsWithAccuracy / 1000, 0.3))

    if (mods & Mods.Bit.Hidden)
        _accValue *= 1.08

    if (mods & Mods.Bit.Flashlight)
        _accValue *= 1.02

    logger.debug("Acc value: " + _accValue)
    return _accValue
}

async function Test(userId: string) {
    let scores = await GetTop({ u: userId, limit: 10 })
    logger.level = LogLevel.Debug
    for (let i = 0; i < scores.length; i++) {
        const score = scores[i]
        let beatmap = await GetBeatmap({ b: score.MapId, mods: score.Mods })
        let calculated = TotalValue(score, beatmap)
        logger.info(`${score.Performance.raw} - Expected result`)
        logger.info(`${calculated.toFixed(3)} - Result`)
        if (score.Performance.raw - score.Performance.raw / 0.05 < calculated && score.Performance.raw + score.Performance.raw / 0.05 > calculated)
            logger.success("Success")
        else logger.error("Error")
    }
}

async function Test2(userId: string) {
    let score = (await GetTop({ u: userId, limit: 1 }))[0]
    let beatmap = (await axios.get("https://osu.ppy.sh/osu/" + score.MapId)).data
    let data = new parser().feed(beatmap)
    logger.debug(data)
}
logger.level = LogLevel.Debug
Test2("8398988")
//Test("8398988")