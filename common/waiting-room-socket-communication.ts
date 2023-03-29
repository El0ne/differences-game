export enum WAITING_ROOM_EVENTS {
    ScanForHost = 'scanForHost',
    HostGame = 'hostGame',
    UnhostGame = 'unhostGame',
    MatchCreated = 'matchCreated',
    MatchDeleted = 'matchDeleted',
    JoinHost = 'joinHost',
    QuitHost = 'quitHost',
    RequestMatch = 'requestMatch',
    UnrequestMatch = 'unrequestMatch',
    AcceptOpponent = 'acceptOpponent',
    DeclineOpponent = 'declineOpponent',
    MatchAccepted = 'matchAccepted',
    MatchRefused = 'matchRefused',
    MatchConfirmed = 'matchConfirmed',
    DeleteGame = 'deleteGame',
    GameDeleted = 'gameDeleted',
}

export interface PlayerInformations {
    playerName: string;
    playerSocketId: string;
}

export interface AcceptationInformation extends PlayerInformations {
    roomId: string;
}

export interface JoinHostInWaitingRequest {
    stageId: string;
    playerName: string;
}

export interface AcceptOpponentInformation extends PlayerInformations {
    isLimitedTimeMode: boolean;
}
