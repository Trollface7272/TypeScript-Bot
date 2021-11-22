import { iProfileCache } from "../interfaces/Profile"
import { OsuProfile } from "../Endpoints/Profile"



let cached: iProfileCache = {}

const expireSpeed = 1000 * 60 * 10
export const AddToCache = (profile: OsuProfile) => {
    cached[profile.id] = {profile: new OsuProfile().LoadFromSelf(profile), expire: Date.now() + expireSpeed}
}

export const GetCached = (id: number|string) => cached[id]?.profile

export const GetFullCache = () => cached
export const SetCache = (inp: iProfileCache) => cached = inp