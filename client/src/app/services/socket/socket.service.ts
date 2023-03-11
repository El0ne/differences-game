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

    get socketId(): string {
        return this.sio.id ? this.sio.id : '';
    }

    connect(): void {
        this.sio = io(environment.serverSocket, { transports: ['websocket'], upgrade: false });
    }

    disconnect(): void {
        this.sio.disconnect();
    }

    liveSocket(): boolean {
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
