export interface GameHistory {
    id: string;
    winnerName: string;
    loserName: string;
    gameName: string;
    gameMode: string;
    gameDuration: number;
    startTime: string;
    isMultiplayer: boolean;
    isAbandon: boolean;
}
