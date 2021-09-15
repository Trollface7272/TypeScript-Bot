import Express from "express"
import path from "path/posix"
import { jsPath } from "../../Paths"

const js = Express()
js.all("/jquery", (req, res) => {
    res.sendFile(path.join(path.resolve(jsPath), "jquery.js"))
})
js.all("/bootstrap", (req, res) => {
    res.sendFile(path.join(path.resolve(jsPath), "bootstrap.js"))
})



export const Js = js