export interface DifferenceInformation {
    differencesPosition: number;
    lastDifferences: number[];
}

export interface MultiplayerDifferenceInformation extends DifferenceInformation {
    room: string;
}

export interface PlayerDifference extends DifferenceInformation {
    socket: string;
}
