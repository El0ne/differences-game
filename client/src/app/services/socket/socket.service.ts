import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    sio: Socket;
    names: Map<string, string> = new Map<string, string>();
    gameRoom: string;

    get socketId() {
        return this.sio.id ? this.sio.id : '';
    }

    connect() {
        this.sio = io(environment.serverUrl, { transports: ['websocket'], upgrade: false });
    }

    disconnect() {
        this.sio.disconnect();
        this.names.clear();
    }

    liveSocket() {
        return this.sio && this.sio.connected;
    }
    listen<T>(eventName: string, action: (data: T) => void): void {
        this.sio.on(eventName, action);
    }
    delete(eventName: string): void {
        this.sio.off(eventName);
    }

    send<T>(eventName: string, data?: T): void {
        if (data) {
            this.sio.emit(eventName, data);
        } else {
            this.sio.emit(eventName);
        }
    }
}
