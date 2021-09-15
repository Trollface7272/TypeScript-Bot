import Express from "express"
import path from "path/posix"

const css = Express()
const basePath = path.resolve("src", "web", "docs", "css")
css.all("/index", (req, res) => {
    res.contentType("css")
    res.sendFile(path.join(path.resolve(basePath), "index.css"))
})


export const CSS = css