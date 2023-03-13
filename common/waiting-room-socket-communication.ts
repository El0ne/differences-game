export enum WaitingRoomEvents {
    ScanForHost = 'scanForHost',
    HostGame = 'hostGame',
    UnhostGame = 'unhostGame',
    GameCreated = 'gameCreated',
    GameDeleted = 'gameDeleted',
    JoinHost = 'joinHost',
    QuitHost = 'quitHost',
    RequestMatch = 'requestMatch',
    UnrequestMatch = 'unrequestMatch',
    AcceptOpponent = 'acceptOpponent',
    DeclineOpponent = 'declineOpponent',
    MatchAccepted = 'matchAccepted',
    MatchRefused = 'matchRefused',
    MatchConfirmed = 'matchConfirmed',
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
