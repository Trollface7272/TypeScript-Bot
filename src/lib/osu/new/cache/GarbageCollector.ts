import { GetFullCache as ProfileCache, SetCache as SetProfile } from "./Profile"

const ToCollect = [{get: ProfileCache, set: SetProfile}]

export const GarbageCollect = () => {
    ToCollect.map(el => {
        const cached = el.get()
        let out = {}
        Object.keys(cached).every(key => {
            if (cached[key].expire > Date.now()) out[key] = cached[key]
        })
        el.set(out)
    })
}