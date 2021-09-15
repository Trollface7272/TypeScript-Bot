import Express from "express"
import { Css } from "./resources/css"
import { Js } from "./resources/js"

const resources = Express()

resources.use("/js", Js)
resources.use("/css", Css)

export const Resources = resources