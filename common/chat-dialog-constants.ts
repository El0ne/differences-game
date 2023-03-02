export interface GameConditions {
    game: string;
    multiplayer: boolean;
}

export interface PlayersInformation {
    player: string;
    room: string;
    adversary?: string;
}
