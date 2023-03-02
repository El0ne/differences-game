import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class RoomHandlerService {
    private currentRoom: number;
    private roomCapacity: number;

    constructor() {
        this.currentRoom = 0;
        this.roomCapacity = 0;
    }

    getCurrentRoom() {
        this.incrementCapacity();
        return this.currentRoom;
    }

    incrementCapacity() {
        this.roomCapacity++;
        if (this.roomCapacity === 2) {
            this.currentRoom++;
            this.roomCapacity = 0;
        }
    }
}
