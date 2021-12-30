import { cachePath } from "@lib/Constants"
import { existsSync, mkdirSync, writeFile } from "fs"
import { join } from "path"
import { iBeatmapRaw } from "../interfaces/Beatmap"

let path = join(cachePath)
if (!existsSync(path)) mkdirSync(path)

path = join(path, "maps")
if (!existsSync(path)) mkdirSync(path)

for (let i = 0; i < 4; i++) {
    if (!existsSync(join(path, i+""))) mkdirSync(join(path, i+""))
}



export const GetCached = (m: string, mods: string, id: string) => {
    const path = join(cachePath, "maps", m, mods, id+".json")
    
    if (existsSync(path)) {
        let map: any
        try {
            map = require(path)
        } catch (err) { console.log(err) }
        return map
    }
}

export const AddToCache = (m: string, mods: string, id: string, data: iBeatmapRaw) => {
    if (!existsSync(join(cachePath, "maps", m, mods))) mkdirSync(join(cachePath, "maps", m, mods))
    writeFile(join(cachePath, "maps", m, mods, id+".json"), JSON.stringify(data), {encoding: "utf-8"}, () => null)
}