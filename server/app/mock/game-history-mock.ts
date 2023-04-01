import { GameHistoryDTO } from '@common/game-history.dto';
import { getFakePlayerGameInfo } from './player-game-info-mock';

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
