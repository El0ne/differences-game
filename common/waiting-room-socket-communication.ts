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
}

export interface OpponentApproval {
    stageId: string;
    opponentId: string;
}

export interface PlayerInformations {
    playerName: string;
    playerSocketId: string;
}

export interface JoinHostInWaitingRequest {
    stageId: string;
    playerName: string;
}
