import { RankingBoard } from './ranking-board';

export class GameCardInformation {
    id: number;
    name: string;
    difficulty: string;
    differenceNumber: number;
    originalImageName: string;
    differenceImageName: string;
    soloTimes: RankingBoard[];
    multiTimes: RankingBoard[];
}
