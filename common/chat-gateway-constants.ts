export interface Validation {
    isValidated: boolean;
    originalMessage: string;
}

export interface RoomMessage {
    socketId: string;
    message: string;
    isEvent: boolean;
    isAbandon: boolean;
}
