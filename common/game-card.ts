import { RankingBoard } from './ranking-board';

export class GameCardInformation {
    name: string;
    difficulty: string;
    originalImageName: string;
    differenceImageName: string;
    soloTimes: RankingBoard[];
    multiTimes: RankingBoard[];
}
