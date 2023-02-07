import { GameCardInformation } from '@common/game-card';

const GAME1: GameCardInformation = {
    name: 'Library',
    difficulty: 'Difficile',
    // TODO: modifie pour image qui vient du serveur
    originalImage: '/assets/444-640x480.jpg',
    differenceImage: '/assets/444-640x480.jpg',
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

const GAME2: GameCardInformation = {
    name: 'game2',
    difficulty: 'Difficile',
    // TODO: modifie pour image qui vient du serveur
    originalImage: '/assets/444-640x480.jpg',
    differenceImage: '/assets/444-640x480.jpg',
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

export const GAMES: GameCardInformation[] = [GAME1, GAME1, GAME2, GAME1, GAME1, GAME2];
