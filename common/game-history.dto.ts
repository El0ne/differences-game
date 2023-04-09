import { PlayerGameInfo } from '@common/player-game-info';

export interface GameHistoryDTO {
    gameId: string;
    gameName: string;
    gameMode: string;
    gameDuration: number;
    startTime: string;
    isMultiplayer: boolean;
    player1: PlayerGameInfo;
    player2?: PlayerGameInfo;
}
