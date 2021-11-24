import { Bot } from "./client/Client"
import { config } from "dotenv"

config()

for(const token of process.env.TOKENS.split(";")) new Bot().Start(token)