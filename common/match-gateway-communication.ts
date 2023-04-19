export const enum MATCH_EVENTS {
    createSoloGame = 'createSoloGame',
    Timer = 'Timer',
    EndTime = 'EndTime',
    StartTime = 'StartTime',
    Difference = 'Difference',
    Win = 'Win',
    SoloGameInformation = 'SoloGameInformation',
    Time = 'Time',
    leaveAndJoinReplayRoom = 'leaveAndJoinReplayRoom',
    TimeModification = 'TimeModification',
    Catch = 'Catch',

    IncrementTimer = 'IncrementTimer',
    LimitedTimeTimer = 'LimitedTimeTimer',
    Lose = 'Lose',
}

export const enum LIMITED_TIME_MODE_EVENTS {
    GetFirstStageInformation = 'getFirstStageInformation',
    NewStageInformation = 'newStageInformation',
    StartLimitedTimeGame = 'startLimitedTimeGame',
    AbortLimitedTimeGame = 'abortLimitedTimeGame',
    Timer = 'timer',
    NextStage = 'nextStage',
    GameHistory = 'GameHistory',
    StoreLimitedGameInfo = 'StoreLimitedGameInfo',
    EndGame = 'EndGame',
    TimeModification = 'timeModification',
}

export const ONE_SECOND_MS = 1000;

export const TWO_MINUTES_SECONDS = 120;

export const EVENT_TIMER_INTERVAL = 250;

export const EVENT_TIMER_INCREMENT = 0.25;

export interface SoloGameCreation {
    stageId: string;
    isLimitedTimeMode: boolean;
}
