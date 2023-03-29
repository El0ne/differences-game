import { RankingBoard } from './ranking-board';

export interface StageInformation {
    _id: string;
    originalImageName: string;
    differenceImageName: string;
}

export interface GameCardInformation extends StageInformation {
    name: string;
    difficulty: string;
    differenceNumber: number;
    soloTimes: RankingBoard[];
    multiTimes: RankingBoard[];
}
