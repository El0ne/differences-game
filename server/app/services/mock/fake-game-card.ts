/* eslint-disable @typescript-eslint/no-magic-numbers */
import { GameCard } from '@app/schemas/game-cards.schemas';
import { ObjectId } from 'mongodb';

export const getFakeGameCard = (): GameCard => ({
    _id: new ObjectId(),
    name: (Math.random() + 1).toString(36).substring(2),
    difficulty: 'Facile',
    differenceNumber: 6,
    soloTimes: [
        { time: 0, name: '--' },
        { time: 0, name: '--' },
        { time: 0, name: '--' },
    ],
    multiTimes: [
        { time: 0, name: '--' },
        { time: 0, name: '--' },
        { time: 0, name: '--' },
    ],
});
