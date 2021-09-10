import Express from "express"

const images = Express()

images.all("/botimage", (req, res) => {
    res.send("https://cdn.discordapp.com/avatars/584321366308814848/580686443db7d77c6d3fcecca1fcbc69.webp")
    //res.send(Client.user.avatarURL())
})





export const Images = images