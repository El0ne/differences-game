/* eslint-disable @typescript-eslint/no-empty-function */
import { TestBed } from '@angular/core/testing';

import { ChatSocketService } from './chat-socket.service';

describe('ChatSocketService', () => {
    let service: ChatSocketService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ChatSocketService);
        service.sio = jasmine.createSpyObj('Socket', ['on', 'emit', 'disconnect']);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('connect should connect to a local server', () => {
        (service.sio as unknown) = undefined;
        service.connect();
        expect(service.sio).toBeTruthy();
    });

    it('disconnect should disconnect socket from the server', () => {
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
