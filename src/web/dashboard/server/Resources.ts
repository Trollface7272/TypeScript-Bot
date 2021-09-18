import Express from "express"
import { Images } from "../../dashboard/server/resources/Images"
import { Css } from "./resources/css"
import { Js } from "./resources/js"

const resources = Express()

resources.use("/js", Js)
resources.use("/css", Css)
resources.use("/images", Images)

export const Resources = resources