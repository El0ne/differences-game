import { RankingBoard } from './ranking-board';

export interface GameCardInformation {
    _id: string;
    name: string;
    difficulty: string;
    differenceNumber: number;
    soloTimes: RankingBoard[];
    multiTimes: RankingBoard[];
}
