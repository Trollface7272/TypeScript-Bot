import { OsuProfile } from "../Profile"

let cached = {}

const expireSpeed = 1000 * 60 * 10
export const AddToCache = (profile: OsuProfile) => {
    cached[profile.id] = {profile, expire: Date.now() + expireSpeed}
}

export const GetFullCache = () => cached
export const SetCache = (inp: any) => cached = inp