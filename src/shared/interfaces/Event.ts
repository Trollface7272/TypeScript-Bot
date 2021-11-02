import {Bot} from "../../bot/client/Client"

export interface RunFunction {
    // eslint-disable-next-line
    (client: Bot, ...args: any[]) : Promise<void>
}

export interface Event {
    name: string,
    run: RunFunction
}