import axios from "axios"


export const GetProfile = async (name: string) => {
    const profile = (await axios.post(`https://forum.neverlose.cc/u/${name}.json`)).data
    if (profile.errors) throw new Error("Profile not found")

    return {
        id: profile.id,
        Username: profile.username,
        Location: profile.location,
        Title: profile.title,

    }
}