import 'module-alias/register'
import ojsama, { ppv2, std_diff, std_ppv2 } from "ojsama"
import { config } from "dotenv"
import { Get as Top } from "@lib/osu/Api/Top"
import { Get as Beatmap } from "@lib/osu/Api/Beatmap"

config();

(async () => {
    const top = (await Top({u: "Trollface", limit: 1, k: process.env.OSU_KEY}))[0]
    const map = (await Beatmap({b: top.MapId, k: process.env.OSU_KEY}))

    const stars = new std_diff()
    stars.aim = map.Difficulty.Aim.raw
    stars.speed = map.Difficulty.Speed.raw
    stars.mods = top.Mods

    const pp = ppv2({
        stars: stars,
        aim_stars: map.Difficulty.Aim.raw,
        base_ar: map.Difficulty.Approach.raw,
        base_od: map.Difficulty.Overall.raw,
        combo: top.Combo,
        max_combo: map.MaxCombo,
        mode: 0,
        mods: top.Mods,
        n100: top.Counts[100],
        n300: top.Counts[300],
        n50: top.Counts[50],
        ncircles: map.Objects.Circle,
        nobjects: map.Objects.Circle + map.Objects.Slider + map.Objects.Spinner,
        nmiss: top.Counts.miss,
        nsliders: map.Objects.Slider,
        speed_stars: map.Difficulty.Star.raw,
        
    })
    console.log(pp);
    
})()