import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    sio: Socket;
    names: string[] = [];
    gameRoom: string;

    connect() {
        this.sio = io(environment.serverUrl, { transports: ['websocket'], upgrade: false });
    }

    disconnect() {
        this.sio.disconnect();
    }

    liveSocket() {
        return this.sio && this.sio.connected;
    }
    listen<T>(eventName: string, action: (data: T) => void): void {
        this.sio.on(eventName, action);
    }

    send<T>(eventName: string, data?: T): void {
        if (data) {
            this.sio.emit(eventName, data);
        } else {
            this.sio.emit(eventName);
        }
    }
}
