import { RankingBoard } from './ranking-board';

export class GameCardInformation {
    name: string;
    difficulty: boolean;
    image: string;
    soloTimes: RankingBoard[];
    multiTimes: RankingBoard[];
    numberOfDifferences: number;
}
