export interface GameCard {
    name: string;
    difficulty: string;
    image: string;
    soloTimes: string[];
    multiTimes: string[];
}

export const game = {
    name: 'Miss Boots',
    difficulty: 'Difficile',
    image: 'https://i.picsum.photos/id/455/640/480.jpg?hmac=jyyuDkvltF5e4BY9rrBhW--AjwPeqm3R2-Kv8UWSU7g',
    soloTimes: ['1:00 Inull', '1:30 Second', '1:45 Third'],
    multiTimes: ['1:25 First', '1:34 Seconda', '1:55 Third'],
};
