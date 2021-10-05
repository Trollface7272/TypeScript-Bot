import axios from "axios"
import { database } from "../../shared/database/Main"


export const GetProfile = async (name: string) => {
    let profile = (await axios.post(`https://forum.neverlose.cc/u/${name}.json`)).data
    if (profile.errors) throw new Error("Profile not found")

    return {
        id: profile.id,
        Username: profile.username,
        Location: profile.location,
        Title: profile.title,

    }
}