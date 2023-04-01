import { PlayerGameInfo } from '@common/player-game-info';

export const getFakePlayerGameInfo = (): PlayerGameInfo => {
    return {
        name: 'string',
        hasAbandon: false,
        hasWon: true,
    };
};
