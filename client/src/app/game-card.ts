import { RankingBoard } from './Classes/ranking-board';

export class GameCard {
    name: string;
    difficulty: string;
    image: string;
    soloTimes: RankingBoard[];
    multiTimes: RankingBoard[];
}

export const game = {
    name: 'Miss Boots',
    difficulty: 'Facile',
    // TODO: modifie pour image qui vient du serveur
    image: 'https://i.picsum.photos/id/455/640/480.jpg?hmac=jyyuDkvltF5e4BY9rrBhW--AjwPeqm3R2-Kv8UWSU7g',
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
