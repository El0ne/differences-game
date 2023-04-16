export const enum MATCH_EVENTS {
    createSoloGame = 'createSoloGame',
    Timer = 'Timer',
    EndTime = 'EndTime',
    StartTime = 'StartTime',
    Difference = 'Difference',
    Win = 'Win',
    SoloGameInformation = 'SoloGameInformation',
    Time = 'Time',
    IncrementTimer = 'IncrementTimer',
    LimitedTimeTimer = 'LimitedTimeTimer',
    Lose = 'Lose',
}

export const enum LIMITED_TIME_MODE_EVENTS {
    GetFirstStageInformation = 'getFirstStageInformation',
    NewStageInformation = 'newStageInformation',
    StartLimitedTimeGame = 'startLimitedTimeGame',
    Timer = 'Timer',
    NextStage = 'nextStage',
}

export const ONE_SECOND = 1000;

export const TWO_MINUTES = 120;

export interface SoloGameCreation {
    stageId: string;
    isLimitedTimeMode: boolean;
}
