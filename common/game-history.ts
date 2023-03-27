export interface GameHistory {
    id: string;
    winnerName: string;
    player1Name: string;
    player2Name: string;
    gameName: string;
    gameMode: string;
    gameDuration: number;
    startTime: string;
    isMultiplayer: boolean;
    isAbandon: boolean;
}
