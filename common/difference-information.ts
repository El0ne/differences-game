export interface DifferenceInformation {
    differencesPosition: number;
    lastDifferences: number[];
}

export interface PlayerDifference extends DifferenceInformation {
    socket: string;
}
