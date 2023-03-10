export interface differenceInformation {
    differencesPosition: number;
    lastDifferences: number[];
    room?: string;
}

export interface playerDifference {
    differenceInformation: differenceInformation;
    socket: string;
}
