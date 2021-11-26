import { Bot } from "./client/Client"
import { config as dotenv } from "dotenv"
import { Connect as Database } from "@database/Main"

dotenv()

Database()

for(const token of process.env.TOKENS.split(";")) new Bot().Start(token)