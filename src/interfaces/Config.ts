export interface Config {
    discord_token: string
    osu_token: string
    mongo_db_url: string
    web_ports: {
        docs: number
        dashboard: number
    }
}