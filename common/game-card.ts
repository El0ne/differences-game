import { RankingBoard } from './ranking-board';

export class GameCardInformation {
    name: string;
    difficulty: string;
    originalImage: string;
    differenceImage: string;
    soloTimes: RankingBoard[];
    multiTimes: RankingBoard[];
}
