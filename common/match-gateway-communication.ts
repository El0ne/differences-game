export enum MATCH_EVENTS {
    createSoloGame = 'createSoloGame',
    Timer = 'Timer',
    EndTime = 'EndTime',
    StartTime = 'StartTime',
    Difference = 'Difference',
    Win = 'Win',
    SoloGameInformation = 'SoloGameInformation',
    Time = 'Time',
    leaveRoom = 'leaveRoom',
    joinReplayRoom = 'joinReplayRoom',
    TimeModification = 'TimeModification',
    Catch = 'Catch',
}

export const ONE_SECOND = 1000;

export const EVENT_TIMER_INTERVAL = 250;

export const EVENT_TIMER_INCREMENT = 0.25;
