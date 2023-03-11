export interface GameConditions {
    game: string;
    multiplayer: boolean;
}

export interface PlayersInformation {
    player: string;
    room: string;
    adversary?: string;
}

export interface EndGame {
    winner: string;
    isSolo: boolean;
}
