import 'module-alias/register'
import { ppv2, std_diff } from "ojsama"
import { config } from "dotenv"
import { iScoreHitcounts } from '@lib/osu/lib/interfaces/Score'
import { OsuBeatmap } from '@lib/osu/lib/Endpoints/Beatmap'
import { Mods } from '@lib/osu/Utils'
import { Score } from '@interfaces/OsuApi'

config();

const Clamp = (val: number, min: number, max: number) => {
    return Math.min(Math.max(val, min), max)
}


class Calculator {
    private Beatmap: OsuBeatmap

    private Counts: iScoreHitcounts
    private AchievedCombo: number
    private SelectedMods: number
    private ScoreVersion: 1|2
    private ComboBasedMissCount: number
    private EffectiveMissCount: number

    private _total: number
    private _aim: number
    private _speed: number
    private _acc: number
    private _flashlight: number

    public get Total() {
        return this._total
    }
    public get Aim() {
        return this._aim
    }
    public get Speed() {
        return this._speed
    }
    public get Acc() {
        return this._acc
    }
    public get Flashlight() {
        return this._flashlight
    }

    private get TotalHits() {
        return this.Counts[50] + this.Counts[100] + this.Counts[300] + this.Counts.miss
    }
    private get TotalSuccessfulHits() {
        return this.Counts[50] + this.Counts[100] + this.Counts[300]
    }
    private get Accuracy() {
        if (this.TotalHits == 0) return 0
        return Clamp((this.Counts[50] * 50 + this.Counts[100] * 100 + this.Counts[300] * 300) / (this.TotalHits * 300), 0, 1)
    }

    constructor(score: Score, beatmap: OsuBeatmap) {
        this.Beatmap = beatmap
        this.Counts = score.Counts
        this.AchievedCombo = score.Combo
        this.SelectedMods = score.Mods
        this.ScoreVersion = Mods.Bit.ScoreV2 & score.Mods ? 2 : 1
        this.ComputeEffectiveMissCount()

        this.ComputeAimValue()
        this.ComputeSpeedValue()
        this.ComputeAccValue()
        this.ComputeFlashlightValue()

        this.ComputeTotalValue()
        delete this.Beatmap
        delete this.Counts
        delete this.AchievedCombo
        delete this.SelectedMods
        delete this.ScoreVersion
        delete this.ComboBasedMissCount
        delete this.EffectiveMissCount
    }

    private ComputeEffectiveMissCount() {
        let comboBasedMissCount = 0
        const beatmapMaxCombo = this.Beatmap.Combo
        if (this.Beatmap.Objects.Sliders > 0) {
            const fullComboThreshold = beatmapMaxCombo - 0.1 * this.Beatmap.Objects.Sliders
            if (this.AchievedCombo < fullComboThreshold)
                comboBasedMissCount = fullComboThreshold / Math.max(1, this.AchievedCombo)
        }
        this.ComboBasedMissCount = Math.min(comboBasedMissCount, this.TotalHits)

        this.EffectiveMissCount = Math.max(this.Counts.miss, (Math.floor(comboBasedMissCount)))
    }

    private ComputeTotalValue() {
        let multiplier = 1.12
        if (Mods.Bit.NoFail & this.SelectedMods)
            multiplier *= Math.max(0.9, 1 - 0.02 * this.EffectiveMissCount)

        const numTotalHits = this.TotalHits
        if (Mods.Bit.SpunOut & this.SelectedMods)
            multiplier *= 1 - Math.pow(this.Beatmap.Objects.Spinners / numTotalHits, 0.85)
        
        this._total =
            Math.pow(
                Math.pow(this.Aim, 1.1) +
                Math.pow(this.Speed, 1.1) +
                Math.pow(this.Acc, 1.1) +
                Math.pow(this.Flashlight, 1.1), 1.0 / 1.1
            ) * multiplier
    }

    private ComputeAimValue() {
        let rawAim = this.Beatmap.Difficulty.Aim

        if (Mods.Bit.TouchDevice & this.SelectedMods)
            rawAim = Math.pow(rawAim, 0.8)

        this._aim = Math.pow(5 * Math.max(1, rawAim / 0.0675) - 4, 3) / 100000

        const numTotalHits = this.TotalHits

        const lengthBonus = 0.95 + 0.4 * Math.min(1, (numTotalHits) / 2000) +
            (numTotalHits > 2000 ? Math.log10((numTotalHits) / 2000) * 0.5: 0)

        this._aim *= lengthBonus

        if (this.EffectiveMissCount > 0)
            this._aim *= 0.97 * Math.pow(1 - Math.pow(this.EffectiveMissCount / (numTotalHits), 0.775), this.EffectiveMissCount)

        const maxCombo = this.Beatmap.Combo
        if (maxCombo > 0)
            this._aim *= Math.min(Math.pow(this.AchievedCombo, 0.8) / Math.pow(maxCombo, 0.8), 1)

        const approachRate = this.Beatmap.Difficulty.Approach
        let approachRateFactor = 0
        if (approachRate > 10.33)
            approachRateFactor = 0.3 * (approachRate - 10.33)
        else if (approachRate < 8)
            approachRateFactor = 0.1 * (8 - approachRate)

        this._aim *= 1 + approachRateFactor * lengthBonus

        if (Mods.Bit.Hidden & this.SelectedMods)
            this._aim *= 1 + 0.04 * (12 - approachRate)

        const estimateDifficultSliders = this.Beatmap.Objects.Sliders * 0.15

        if (this.Beatmap.Objects.Sliders > 0) {
            const estimateSliderEndsDropped = Math.min(Math.max(Math.min(this.Counts[100] + this.Counts[50] + this.Counts.miss, maxCombo - this.AchievedCombo), 0), estimateDifficultSliders)
            const sliderFactor = 1
            const sliderNerfFactor = (1 - sliderFactor) * Math.pow(1.0 - estimateSliderEndsDropped / estimateDifficultSliders, 3) + sliderFactor
            this._aim *= sliderNerfFactor
        }

        this._aim *= this.Accuracy
        this._aim *= 0.98 + (Math.pow(this.Beatmap.Difficulty.Overall, 2) / 2500)
    }

    private ComputeSpeedValue() {
        this._speed = Math.pow(5 * Math.max(1, this.Beatmap.Difficulty.Speed / 0.0675) - 4, 3) / 100000

        const numTotalHits = this.TotalHits
    
        const lengthBonus = 0.95 + 0.4 * Math.min(1, (numTotalHits) / 2000) +
            (numTotalHits > 2000 ? Math.log10((numTotalHits) / 2000) * 0.5: 0)
        this._speed *= lengthBonus
    
        if (this.EffectiveMissCount > 0)
            this._speed *= 0.97 * Math.pow(1 - Math.pow(this.EffectiveMissCount / (numTotalHits), 0.775), Math.pow(this.EffectiveMissCount, 0.875))
    
        const maxCombo = this.Beatmap.Combo
        if (maxCombo > 0)
            this._speed *= Math.min((Math.pow(this.AchievedCombo, 0.8) / Math.pow(maxCombo, 0.8)), 1)
    
        const approachRate = this.Beatmap.Difficulty.Approach
        let approachRateFactor = 0
        if (approachRate > 10.33)
            approachRateFactor = 0.3 * (approachRate - 10.33)
    
        this._speed *= 1 + approachRateFactor * lengthBonus
    
        if (Mods.Bit.Hidden & this.SelectedMods)
            this._speed *= 1 + 0.04 * (12 - approachRate)
    
        this._speed *= (0.95 + Math.pow(this.Beatmap.Difficulty.Overall, 2) / 750) * Math.pow(this.Accuracy, (14.5 - Math.max(this.Beatmap.Difficulty.Overall, 8)) / 2)
        this._speed *= Math.pow(0.98, this.Counts[50] < numTotalHits / 500 ? 0 : this.Counts[50] - numTotalHits / 500) 
    }

    private ComputeAccValue() {
        let betterAccuracyPercentage: number

        let numHitObjectsWithAccuracy: number
        if (this.ScoreVersion == 2) {
            numHitObjectsWithAccuracy = this.TotalHits
            betterAccuracyPercentage = this.Accuracy
        } else {
            numHitObjectsWithAccuracy = this.Beatmap.Objects.Circles
            if (numHitObjectsWithAccuracy > 0)
                betterAccuracyPercentage = ((this.Counts[300] - (this.TotalHits - numHitObjectsWithAccuracy)) * 6 + this.Counts[100] * 2 + this.Counts[50]) / (numHitObjectsWithAccuracy * 6)
            else
                betterAccuracyPercentage = 0;

            if (betterAccuracyPercentage < 0)
                betterAccuracyPercentage = 0;
        }

        this._acc =
            Math.pow(1.52163, this.Beatmap.Difficulty.Overall) * Math.pow(betterAccuracyPercentage, 24) * 2.83

        this._acc *= Math.min(1.15, (Math.pow(numHitObjectsWithAccuracy / 1000, 0.3)))

        if (Mods.Bit.Hidden & this.SelectedMods)
            this._acc *= 1.08

        if (Mods.Bit.Flashlight & this.SelectedMods)
            this._acc *= 1.02
    }

    private ComputeFlashlightValue() { this._flashlight = 0 }
}







 (async () => {
    const top = null//(await Top({ u: "Trollface", limit: 3, k: process.env.OSU_KEY }))[2]
    const map = await new OsuBeatmap().Load({ b: top.MapId, k: process.env.OSU_KEY })

    const stars = new std_diff()
    stars.aim = map.Difficulty.Aim
    stars.speed = map.Difficulty.Speed
    stars.mods = top.Mods

    const ojsamapp = ppv2({
        stars: stars,
        aim_stars: map.Difficulty.Aim,
        base_ar: map.Difficulty.Approach,
        base_od: map.Difficulty.Overall,
        combo: top.Combo,
        max_combo: map.Combo,
        mode: 0,
        mods: top.Mods,
        n100: top.Counts[100],
        n300: top.Counts[300],
        n50: top.Counts[50],
        ncircles: map.Objects.Circles,
        nobjects: map.Objects.Circles + map.Objects.Sliders + map.Objects.Spinners,
        nmiss: top.Counts.miss,
        nsliders: map.Objects.Sliders,
        speed_stars: map.Difficulty.Star,

    })
    const mypp = new Calculator(top, map)
    console.log(ojsamapp);
    console.log(mypp);
    

})()