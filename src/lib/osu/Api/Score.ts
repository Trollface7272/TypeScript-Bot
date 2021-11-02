import { linkBase } from './Api';
import axios from 'axios';
import { RoundFixed, CommaFormat } from '../Utils';
import { Score, ScoreParams } from '../../../shared/interfaces/OsuApi';

const endpoint: string = linkBase + 'api/get_scores';
interface get_score {
	score_id:		  string
    score:			  string
    username:		  string
    count300:		  string
    count100:		  string
    count50:		  string
    countmiss:		  string
    maxcombo:		  string
    countkatu:		  string
    countgeki:		  string
    perfect:		  string
    enabled_mods:	  string
    user_id:		  string
    date:			  string
    rank:			  string
    pp:				  string
    replay_available: string
}

export async function Get(params: ScoreParams): Promise<Array<Score>> {
	const data: get_score[] = (await axios.get(endpoint, { params })).data
	if (!data || data.length < 1) throw { code: 5 }
	const out: Array<Score> = []
	if (data.length == 0) throw { code: 7 }

	for (let i = 0; i < data.length; i++) {
		const el = data[i];
		out.push({
			Index: i + 1,
			UserId: parseInt(el.user_id),
			Username: null,
			MapId: params.b,
			Score: {
				raw: parseInt(el.score),
				Formatted: CommaFormat(parseInt(el.score)),
			},
			Counts: {
				'300': parseInt(el.count300),
				'100': parseInt(el.count100),
				'50': parseInt(el.count50),
				katu: parseInt(el.countkatu),
				geki: parseInt(el.countgeki),
				miss: parseInt(el.countmiss),
			},
			Combo: parseInt(el.maxcombo),
			Perfect: el.perfect == '1',
			Mods: parseInt(el.enabled_mods),
			Date: new Date(el.date),
			Rank: el.rank,
			Performance: {
				raw: parseFloat(el.pp),
				Formatted: CommaFormat(RoundFixed(parseFloat(el.pp))),
			},
			Downloadable: el.replay_available == '1',
		});
	}

	return out;
}
