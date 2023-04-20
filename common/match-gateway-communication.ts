export const enum MATCH_EVENTS {
    createSoloGame = 'createSoloGame',
    Timer = 'timer',
    EndTime = 'endTime',
    StartTime = 'startTime',
    Difference = 'difference',
    Win = 'win',
    SoloGameInformation = 'soloGameInformation',
    Time = 'time',
    IncrementTimer = 'incrementTimer',
    LimitedTimeTimer = 'limitedTimeTimer',
    Lose = 'lose',
}

export const enum LIMITED_TIME_MODE_EVENTS {
    GetFirstStageInformation = 'getFirstStageInformation',
    NewStageInformation = 'newStageInformation',
    StartLimitedTimeGame = 'startLimitedTimeGame',
    AbortLimitedTimeGame = 'abortLimitedTimeGame',
    Timer = 'timer',
    NextStage = 'nextStage',
    GameHistory = 'gameHistory',
    StoreLimitedGameInfo = 'storeLimitedGameInfo',
    EndGame = 'endGame',
    TimeModification = 'timeModification',
}

export const ONE_SECOND_MS = 1000;

export const TWO_MINUTES_SECONDS = 120;

export interface SoloGameCreation {
    stageId: string;
    isLimitedTimeMode: boolean;
}
