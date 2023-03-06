export interface Validation {
    validated: boolean;
    originalMessage: string;
}

export interface RoomMessage {
    socketId: string;
    message: string;
    event: boolean;
}
