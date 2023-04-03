import { GameHistoryDTO } from '@common/game-history.dto';
import { PlayerGameInfo } from '@common/player-game-info';

export const getFakePlayerGameInfo = (): PlayerGameInfo => {
    return {
        name: 'string',
        hasAbandon: false,
        hasWon: true,
    };
};

export const getFakeGameHistoryElement = (): GameHistoryDTO => {
    return {
        gameId: 'string',
        gameName: 'string',
        gameMode: 'string',
        gameDuration: 12,
        startTime: 'string',
        isMultiplayer: true,
        player1: getFakePlayerGameInfo(),
    };
};

export const FAKE_GAME_HISTORY: GameHistoryDTO[] = [
    getFakeGameHistoryElement(),
    getFakeGameHistoryElement(),
    getFakeGameHistoryElement(),
    getFakeGameHistoryElement(),
];

export const FAKE_GAME_HISTORY_SINGLE: GameHistoryDTO = getFakeGameHistoryElement();
