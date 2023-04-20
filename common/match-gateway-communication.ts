export const enum MATCH_EVENTS {
    createSoloGame = 'createSoloGame',
    Timer = 'classicTimer',
    EndTime = 'endTime',
    StartTime = 'startTime',
    Difference = 'difference',
    Win = 'win',
    SoloGameInformation = 'soloGameInformation',
    Time = 'time',
    leaveAndJoinReplayRoom = 'leaveAndJoinReplayRoom',
    TimeModification = 'timeModification',
    Catch = 'catch',
    IncrementTimer = 'incrementTimer',
    LimitedTimeTimer = 'limitedTimeTimer',
    Lose = 'lose',
}

export const enum LIMITED_TIME_MODE_EVENTS {
    GetFirstStageInformation = 'getFirstStageInformation',
    NewStageInformation = 'newStageInformation',
    StartLimitedTimeGame = 'startLimitedTimeGame',
    AbortLimitedTimeGame = 'abortLimitedTimeGame',
    Timer = 'limitedTimer',
    NextStage = 'nextStage',
    GameHistory = 'gameHistory',
    StoreLimitedGameInfo = 'storeLimitedGameInfo',
    EndGame = 'endGame',
}

export const ONE_SECOND_MS = 1000;

export const TWO_MINUTES_SECONDS = 120;

export const EVENT_TIMER_INTERVAL = 250;

export const EVENT_TIMER_INCREMENT = 0.25;

export interface SoloGameCreation {
    stageId: string;
    isLimitedTimeMode: boolean;
}
