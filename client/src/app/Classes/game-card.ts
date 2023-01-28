import { RankingBoard } from './ranking-board';

export class GameCardInformation {
    name: string;
    difficulty: string;
    image: string;
    soloTimes: RankingBoard[];
    multiTimes: RankingBoard[];
}

export const game = {
    name: 'Library',
    difficulty: 'Difficile',
    // TODO: modifie pour image qui vient du serveur
    image: '/assets/444-640x480.jpg',
    soloTimes: [
        { time: 60, name: 'Inull' },
        { time: 90, name: 'second' },
        { time: 105, name: 'third' },
    ],
    multiTimes: [
        { time: 63, name: 'First' },
        { time: 92, name: 'second' },
        { time: 115, name: 'third' },
    ],
};
