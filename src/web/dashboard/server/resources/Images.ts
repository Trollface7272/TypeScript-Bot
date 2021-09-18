import Express from "express"
//import { Client } from "../../../../bot"

const images = Express()

images.all("/bot", (req, res) => {
    res.send("https://cdn.discordapp.com/avatars/584321366308814848/580686443db7d77c6d3fcecca1fcbc69.webp")
    //res.send(Client.user.avatarURL())
})





export const Images = images