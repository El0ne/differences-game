import { RankingBoard } from './ranking-board';

export class GameCardInformation {
    name: string;
    difficulty: string;
    image: string;
    soloTimes: RankingBoard[];
    multiTimes: RankingBoard[];
}
