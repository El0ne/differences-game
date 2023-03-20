export enum ChatEvents {
    Abandon = 'abandon',
    Hint = 'hint',
    Event = 'event',
    Message = 'message',
    Validate = 'validate',
    BroadcastAll = 'broadcastAll',
    JoinRoom = 'joinRoom',
    RoomMessage = 'roomMessage',
    RoomCheck = 'roomCheck',

    PlayerWaiting = 'PlayerWaiting',
    WaitingRoom = 'WaitingRoom',
    WordValidated = 'wordValidated',
    MassMessage = 'massMessage',
    Hello = 'hello',
    Clock = 'clock',
    Difference = 'Difference',
    Win = 'Win',
    Disconnect = 'Disconnect',
}

export interface RoomManagement {
    room: string;
    message: string;
}

export interface Room {
    gameId: string;
    roomId: string;
    awaitingPlayer: string;
}

export interface MultiplayerRequestInformation {
    game: string;
    name: string;
}

export interface RoomEvent {
    room: string;
    event: string;
    isMultiplayer: boolean;
}
