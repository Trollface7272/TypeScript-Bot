import { ApplicationCommandData } from "discord.js"
import Troll from "./Troll"
import SocialCredit from "./SocialCredit"
import osu from "./osu"
import Moderation from "./Moderation"
import InfoCommands from "./InfoCommands"
import Fun from "./Fun"
import Customization from "./Customization"



const InteractionList: ApplicationCommandData[] = [...Troll, ...SocialCredit, ...osu, ...Moderation, ...InfoCommands, ...Fun, ...Customization ]



export default InteractionList