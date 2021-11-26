import { Mods } from "./Constants"
import { OsuBeatmap } from "./Endpoints/Beatmap"
import { Score } from "./Endpoints/Score"
import { Clamp, CommaFormat } from "./Functions"
import { iBeatmapObjects } from "./interfaces/Beatmap"
import { iScoreHitcounts } from "./interfaces/Score"

export class CalculatorBase {
    constructor() {};
    protected Beatmap: OsuBeatmap
    public Formatted: {AccPerc?:string,Total:string}

    protected Counts: iScoreHitcounts
    protected AchievedCombo: number
    protected SelectedMods: number
    protected ScoreVersion: 1|2
    protected ComboBasedMissCount: number
    protected EffectiveMissCount: number

    protected _total: number
    protected _aim: number
    protected _speed: number
    protected _acc: number
    protected _flashlight: number

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

    protected get TotalHits() {
        return this.Counts[50] + this.Counts[100] + this.Counts[300] + this.Counts.miss
    }
    protected get TotalSuccessfulHits() {
        return this.Counts[50] + this.Counts[100] + this.Counts[300]
    }
    protected get Accuracy() {
        if (this.TotalHits == 0) return 0
        return Clamp((this.Counts[50] * 50 + this.Counts[100] * 100 + this.Counts[300] * 300) / (this.TotalHits * 300), 0, 1)
    }

    
    protected ComputeEffectiveMissCount() {
        let comboBasedMissCount = 0
        let beatmapMaxCombo = this.Beatmap.Combo
        if (this.Beatmap.Objects.Sliders > 0) {
            let fullComboThreshold = beatmapMaxCombo - 0.1 * this.Beatmap.Objects.Sliders
            if (this.AchievedCombo < fullComboThreshold)
                comboBasedMissCount = fullComboThreshold / Math.max(1, this.AchievedCombo)
        }
        this.ComboBasedMissCount = Math.min(comboBasedMissCount, this.TotalHits)

        this.EffectiveMissCount = Math.max(this.Counts.miss, (Math.floor(comboBasedMissCount)))
    }

    protected ComputeTotalValue() {
        let multiplier = 1.12
        if (Mods.NoFail & this.SelectedMods)
            multiplier *= Math.max(0.9, 1 - 0.02 * this.EffectiveMissCount)

        let numTotalHits = this.TotalHits
        if (Mods.SpunOut & this.SelectedMods)
            multiplier *= 1 - Math.pow(this.Beatmap.Objects.Spinners / numTotalHits, 0.85)
        
        this._total =
            Math.pow(
                Math.pow(this.Aim, 1.1) +
                Math.pow(this.Speed, 1.1) +
                Math.pow(this.Acc, 1.1) +
                Math.pow(this.Flashlight, 1.1), 1.0 / 1.1
            ) * multiplier
    }

    protected ComputeAimValue() {
        let rawAim = this.Beatmap.Difficulty.Aim

        if (Mods.TouchDevice & this.SelectedMods)
            rawAim = Math.pow(rawAim, 0.8)

        this._aim = Math.pow(5 * Math.max(1, rawAim / 0.0675) - 4, 3) / 100000

        const numTotalHits = this.TotalHits

        const lengthBonus = 0.95 + 0.4 * Math.min(1, (numTotalHits) / 2000) +
            (numTotalHits > 2000 ? Math.log10((numTotalHits) / 2000) * 0.5: 0)

        this._aim *= lengthBonus

        if (this.EffectiveMissCount > 0)
            this._aim *= 0.97 * Math.pow(1 - Math.pow(this.EffectiveMissCount / (numTotalHits), 0.775), this.EffectiveMissCount)

        let maxCombo = this.Beatmap.Combo
        if (maxCombo > 0)
            this._aim *= Math.min(Math.pow(this.AchievedCombo, 0.8) / Math.pow(maxCombo, 0.8), 1)

        const approachRate = this.Beatmap.Difficulty.Approach
        let approachRateFactor = 0
        if (approachRate > 10.33)
            approachRateFactor = 0.3 * (approachRate - 10.33)
        else if (approachRate < 8)
            approachRateFactor = 0.1 * (8 - approachRate)

        this._aim *= 1 + approachRateFactor * lengthBonus

        if (Mods.Hidden & this.SelectedMods)
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

    protected ComputeSpeedValue() {
        this._speed = Math.pow(5 * Math.max(1, this.Beatmap.Difficulty.Speed / 0.0675) - 4, 3) / 100000

        const numTotalHits = this.TotalHits
    
        let lengthBonus = 0.95 + 0.4 * Math.min(1, (numTotalHits) / 2000) +
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
    
        if (Mods.Hidden & this.SelectedMods)
            this._speed *= 1 + 0.04 * (12 - approachRate)
    
        this._speed *= (0.95 + Math.pow(this.Beatmap.Difficulty.Overall, 2) / 750) * Math.pow(this.Accuracy, (14.5 - Math.max(this.Beatmap.Difficulty.Overall, 8)) / 2)
        this._speed *= Math.pow(0.98, this.Counts[50] < numTotalHits / 500 ? 0 : this.Counts[50] - numTotalHits / 500) 
    }

    protected ComputeAccValue() {
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

        if (Mods.Hidden & this.SelectedMods)
            this._acc *= 1.08

        if (Mods.Flashlight & this.SelectedMods)
            this._acc *= 1.02
    }

    protected ComputeFlashlightValue() { this._flashlight = 0 }
}

export class Calculator extends CalculatorBase {
    constructor(score: Score) {
        super()
        this.Beatmap = score.Beatmap
        this.Counts = score.Counts
        this.AchievedCombo = score.Combo
        this.SelectedMods = score.Mods
        this.ScoreVersion = Mods.ScoreV2 & score.Mods ? 2 : 1
        this.ComputeEffectiveMissCount()

        this.ComputeAimValue()
        this.ComputeSpeedValue()
        this.ComputeAccValue()
        this.ComputeFlashlightValue()

        this.ComputeTotalValue()
        
        this.Formatted = {
            Total: CommaFormat(this.Total),
            AccPerc: score.Accuracy?.toFixed(2)
        }
        delete this.Beatmap
        delete this.Counts
        delete this.AchievedCombo
        delete this.SelectedMods
        delete this.ScoreVersion
        delete this.ComboBasedMissCount
        delete this.EffectiveMissCount
    }

}

export class CalculatorFromAcc extends CalculatorBase {
    constructor(score: Score, acc: number) {
        super()
        this.Beatmap = score.Beatmap
        this.Counts = this.AccToCounts(acc, score.Beatmap.Objects)
        this.AchievedCombo = score.Combo
        this.SelectedMods = score.Mods
        this.ScoreVersion = Mods.ScoreV2 & score.Mods ? 2 : 1
        this.ComputeEffectiveMissCount()

        this.ComputeAimValue()
        this.ComputeSpeedValue()
        this.ComputeAccValue()
        this.ComputeFlashlightValue()

        this.ComputeTotalValue()
        this.Formatted = {
            Total: CommaFormat(this.Total),
            AccPerc: score.Accuracy.toFixed(2)
        }
        delete this.Beatmap
        delete this.Counts
        delete this.AchievedCombo
        delete this.SelectedMods
        delete this.ScoreVersion
        delete this.ComboBasedMissCount
        delete this.EffectiveMissCount
    }

    private AccToCounts(acc: number, obj: iBeatmapObjects): iScoreHitcounts {
        const objects = obj.Circles + obj.Sliders + obj.Spinners
        let c100 = Math.round(-3.0 * ((acc * 0.01 - 1.0) * objects) * 0.5)
        if (c100 > objects) {
            c100 = 0
            const c50 = Math.round(-6.0 * ((acc * 0.01 - 1.0) * objects) * 0.5)
            return {
                "300": objects - c100 - c50,
                "100": c100,
                "50": c50,
                miss: 0
            }
        }
        return {
            "300": objects - c100,
            "100": c100,
            "50": 0,
            miss: 0
        }
    }
}

export class MapCalculator extends CalculatorBase {
    public AccPerc: number
    constructor(beatmap: OsuBeatmap, mods: number, acc: number) {
        super()
        this.Beatmap = beatmap
        this.Counts = this.AccToCounts(acc, beatmap.Objects)
        this.AchievedCombo = beatmap.Combo
        this.SelectedMods = mods
        this.ScoreVersion = Mods.ScoreV2 & mods ? 2 : 1
        this.AccPerc = acc
        this.ComputeEffectiveMissCount()

        this.ComputeAimValue()
        this.ComputeSpeedValue()
        this.ComputeAccValue()
        this.ComputeFlashlightValue()

        this.ComputeTotalValue()
        this.Formatted = {
            Total: CommaFormat(this.Total),
            AccPerc: acc.toFixed(2)
        }
        delete this.Beatmap
        delete this.Counts
        delete this.AchievedCombo
        delete this.SelectedMods
        delete this.ScoreVersion
        delete this.ComboBasedMissCount
        delete this.EffectiveMissCount
    }

    private AccToCounts(acc: number, obj: iBeatmapObjects): iScoreHitcounts {
        const objects = obj.Circles + obj.Sliders + obj.Spinners
        let c100 = Math.round(-3.0 * ((acc * 0.01 - 1.0) * objects) * 0.5)
        if (c100 > objects) {
            c100 = 0
            const c50 = Math.round(-6.0 * ((acc * 0.01 - 1.0) * objects) * 0.5)
            return {
                "300": objects - c100 - c50,
                "100": c100,
                "50": c50,
                miss: 0
            }
        }
        return {
            "300": objects - c100,
            "100": c100,
            "50": 0,
            miss: 0
        }
    }
}