import { RankingBoard } from './ranking-board';

export class GameCardInformation {
    id: string;
    name: string;
    difficulty: string;
    differenceNumber: number;
    originalImageName: string;
    differenceImageName: string;
    soloTimes: RankingBoard[];
    multiTimes: RankingBoard[];
    numberOfDifferences: number;
}
