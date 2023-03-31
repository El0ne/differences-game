export enum MATCH_EVENTS {
    createSoloGame = 'createSoloGame',
    Timer = 'Timer',
    EndTime = 'EndTime',
    StartTime = 'StartTime',
    Difference = 'Difference',
    Win = 'Win',
}

export const ONE_SECOND = 1000;

export interface SoloGameCreation {
    stageId: string;
    isLimitedTimeMode: boolean;
}
