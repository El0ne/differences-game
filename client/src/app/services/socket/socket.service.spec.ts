/* eslint-disable @typescript-eslint/no-empty-function */
import { TestBed } from '@angular/core/testing';

import { SocketService } from './socket.service';

describe('SocketService', () => {
    let service: SocketService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SocketService);
        service.sio = jasmine.createSpyObj('Socket', ['on', 'off', 'emit', 'disconnect']);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('delete should delete the listener of the sio', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        service.connect();
        service.sio.on('testEvent', () => {
            return;
        });
        service.delete('testEvent');
        expect(service.sio.hasListeners('testEvent')).toBeFalsy();
    });
    it('get SocketId() should return the socketId if valid', () => {
        const socketId = '';
        expect(socketId).toEqual(service['socketId']);
        service.sio.id = '123';
        expect(service['socketId']).toEqual('123');
    });

    it('connect should connect to a local server', () => {
        (service.sio as unknown) = undefined;
        service.connect();
        expect(service.sio).toBeTruthy();
    });

    it('disconnect should disconnect socket from the server', () => {
        service.disconnect();
        expect(service.sio.disconnect).not.toHaveBeenCalled();

        spyOn(service, 'liveSocket').and.returnValue(true);
        service.disconnect();
        expect(service.sio.disconnect).toHaveBeenCalled();
    });

    it('livesocket should check for connection to server', () => {
        service.sio.connected = true;
        const result = service.liveSocket();
        expect(result).toBeTrue();
    });

    it('liveSocket should return false if the socket is no longer connected', () => {
        service.sio.connected = false;
        const result = service.liveSocket();
        expect(result).toBeFalsy();
    });

    it('liveSocket should return false if the socket is not defined', () => {
        (service.sio as unknown) = undefined;
        const isAlive = service.liveSocket();
        expect(isAlive).toBeFalsy();
    });

    it('listen should set a socket event depending on event', () => {
        const event = 'helloWorld';
        const action = () => {};
        service.listen(event, action);
        expect(service.sio.on).toHaveBeenCalled();
        expect(service.sio.on).toHaveBeenCalledWith(event, action);
    });

    it('send should emit an event to a server', () => {
        const eventName = 'testEvent';
        const testData = { foo: 'bar' };
        service.send(eventName, testData);
        expect(service.sio.emit).toHaveBeenCalledWith(eventName, testData);
        service.send(eventName);
        expect(service.sio.emit).toHaveBeenCalledWith(eventName);
    });
});
