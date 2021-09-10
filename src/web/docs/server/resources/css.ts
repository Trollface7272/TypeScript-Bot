import Express from "express"
import path from "path/posix"

const css = Express()

css.all("/index", (req, res) => {
    res.contentType("css")
    res.sendFile(path.join(__dirname, "/css/index.css"))
})


export const CSS = css