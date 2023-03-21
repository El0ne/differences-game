export enum CHAT_EVENTS {
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

export const WORD_MIN_LENGTH = 6;
export const MESSAGE_MAX_LENGTH = 200;
export const DELAY_BEFORE_EMITTING_TIME = 1000;
export const PRIVATE_ROOM_ID = 'serverRoom';
