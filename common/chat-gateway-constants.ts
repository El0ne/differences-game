export interface Validation {
    isValidated: boolean;
    originalMessage: string;
}

export interface RoomMessage {
    socketId: string;
    message: string;
    event: string;
}
