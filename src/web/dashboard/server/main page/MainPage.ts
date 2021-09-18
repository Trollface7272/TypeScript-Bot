import Express from "express"
import path from "path/posix"
import { htmlPath } from "../../Paths"

const mainPage = Express()

mainPage.all("/", (req, res) => {
    res.sendFile(path.join(htmlPath, "mainpage.html"))
})

export const MainPage = mainPage