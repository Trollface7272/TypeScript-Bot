import Express from "express"
import path from "path/posix"
import { cssPath } from "../../Paths"

const css = Express()
css.all("/bootstrap", (req, res) => {
    res.sendFile(path.join(path.resolve(cssPath), "bootstrap.css"))
})

css.all("/mainpage", (req, res) => {
    res.sendFile(path.join(path.resolve(cssPath), "mainpage.css"))
})



export const Css = css