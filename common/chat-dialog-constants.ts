export interface GameConditions {
    game: string;
    isMultiplayer: boolean;
}

export interface PlayersInformation {
    player: string;
    room: string;
    adversary?: string;
}
