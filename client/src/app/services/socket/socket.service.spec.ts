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
});
