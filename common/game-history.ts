export interface GameHistory {
    id: string;
    winnerName: string;
    loserName: string;
    gameName: string;
    gameDuration: number;
    startTime: string;
    isMultiplayer: boolean;
    isAbandon: boolean;
}
