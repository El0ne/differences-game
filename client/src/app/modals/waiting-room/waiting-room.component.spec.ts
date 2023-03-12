/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketService } from '@app/services/socket/socket.service';
import { AcceptationInformation, PlayerInformations, WaitingRoomEvents } from '@common/waiting-room-socket-communication';
import { WaitingRoomComponent, WaitingRoomDataPassing } from './waiting-room.component';

describe('WaitingRoomComponent', () => {
    let component: WaitingRoomComponent;
    let fixture: ComponentFixture<WaitingRoomComponent>;
    let matDialogSpy: MatDialogRef<WaitingRoomComponent>;
    let socketServiceSpy: SocketService;
    let routerSpy: Router;

    beforeEach(async () => {
        matDialogSpy = jasmine.createSpyObj('MatDialogRef<ChosePlayerNameDialogComponent>', ['close']);
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['names', 'listen', 'delete', 'send', 'connect'], ['socketId']);
        socketServiceSpy.names = new Map<string, string>();
        socketServiceSpy.sio = jasmine.createSpyObj('Socket', ['connect', 'on', 'off', 'emit', 'disconnect', 'hasListeners']);
        routerSpy = jasmine.createSpyObj(Router, ['navigate']);

        await TestBed.configureTestingModule({
            declarations: [WaitingRoomComponent],
            imports: [RouterTestingModule, MatDialogModule],
            providers: [
                { provide: MatDialogRef, useValue: matDialogSpy },
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: MAT_DIALOG_DATA, useValue: { stageId: '123', isHost: true } as WaitingRoomDataPassing },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(WaitingRoomComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect((component.waitingRoomInfo = { stageId: '123', isHost: true }));
    });

    it('all listeners should be removed at the destor of the dialog', () => {
        socketServiceSpy.connect();
        component.ngOnDestroy();
        expect(socketServiceSpy.delete).toHaveBeenCalledWith(WaitingRoomEvents.RequestMatch);
        expect(socketServiceSpy.delete).toHaveBeenCalledWith(WaitingRoomEvents.UnrequestMatch);
        expect(socketServiceSpy.delete).toHaveBeenCalledWith(WaitingRoomEvents.MatchConfirmed);
        component.waitingRoomInfo.isHost = false;
        component.ngOnInit();
        expect(socketServiceSpy.delete).toHaveBeenCalledWith(WaitingRoomEvents.MatchAccepted);
        expect(socketServiceSpy.delete).toHaveBeenCalledWith(WaitingRoomEvents.MatchRefused);
    });

    it('handleCancel shoul emit the right event depending on isHost', () => {
        component.handleCancel();
        expect(matDialogSpy.close).toHaveBeenCalled();
        expect(socketServiceSpy.send).toHaveBeenCalledWith(WaitingRoomEvents.UnhostGame);

        component.waitingRoomInfo.isHost = false;
        component.handleCancel();
        expect(socketServiceSpy.send).toHaveBeenCalledWith(WaitingRoomEvents.QuitHost);
    });

    it('navigateTo1v1 should close the dialog and navigate to the right game', () => {
        component.navigateTo1v1('gameRoom');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/1v1/123']);
    });

    it('acceptOpponent should send an acceptOpponent event and add the opponent name to the map', () => {
        component.clientsInWaitingRoom.set('opponentId', 'testName');
        spyOn(socketServiceSpy.names, 'set').and.callThrough();
        socketServiceSpy.names.set('socketId', 'myName');
        Object.defineProperty(socketServiceSpy, 'socketId', { value: 'socketId' });
        component.acceptOpponent('opponentId');
        expect(socketServiceSpy.names.set).toHaveBeenCalledWith('opponentId', 'testName');
        const expectedAcceptRequest: PlayerInformations = { playerName: 'myName', playerSocketId: 'opponentId' };
        expect(socketServiceSpy.send).toHaveBeenCalledWith(WaitingRoomEvents.AcceptOpponent, expectedAcceptRequest);
    });

    it('declineOpponent should send the envent to the refused opponent and remove him from the opponents map', () => {
        component.clientsInWaitingRoom.set('opponentId', 'testName');
        component.declineOpponent('opponentId');
        expect(component.clientsInWaitingRoom.has('opponentId')).toBeFalsy();
        expect(socketServiceSpy.send).toHaveBeenCalledWith(WaitingRoomEvents.DeclineOpponent, 'opponentId');
    });

    it('a requestMatch event should add the opponent to the map', () => {
        socketServiceSpy.listen = (event: string, callback: any) => {
            if (event === WaitingRoomEvents.RequestMatch) callback({ playerName: 'testName', playerSocketId: 'opponentId' } as PlayerInformations);
        };
        component.ngOnInit();
        expect(component.clientsInWaitingRoom.get('opponentId')).toEqual('testName');
    });

    it('a unrequestMatch event should remove opponent to the map', () => {
        component.clientsInWaitingRoom.set('opponentId', 'nom');
        socketServiceSpy.listen = (event: string, callback: any) => {
            if (event === WaitingRoomEvents.UnrequestMatch) callback('opponentId');
        };
        component.ngOnInit();
        expect(component.clientsInWaitingRoom.has('opponentId')).toBeFalsy();
    });

    it('Match confirmed should redirect the host to the game', () => {
        spyOn(component, 'navigateTo1v1').and.callThrough();
        socketServiceSpy.listen = (event: string, callback: any) => {
            if (event === WaitingRoomEvents.MatchConfirmed) callback('opponentId');
        };
        component.ngOnInit();
        expect(component.navigateTo1v1).toHaveBeenCalled();
    });

    it('matchAccepted event should add the gameHost to the map and redirect to the game', () => {
        spyOn(component, 'navigateTo1v1').and.callThrough();
        component.clientsInWaitingRoom.set('opponentId', 'nom');
        component.waitingRoomInfo.isHost = false;
        socketServiceSpy.listen = (event: string, callback: any) => {
            if (event === WaitingRoomEvents.MatchAccepted)
                callback({ playerName: 'hostName', playerSocketId: 'hostId', roomId: 'roomId' } as AcceptationInformation);
        };
        component.ngOnInit();
        expect(socketServiceSpy.names.get('hostId')).toEqual('hostName');
        expect(component.navigateTo1v1).toHaveBeenCalled();
    });

    it('matchRefused event should alert the player and close the dialog', () => {
        component.waitingRoomInfo.isHost = false;
        spyOn(window, 'alert').and.callFake(() => {
            return;
        });
        socketServiceSpy.listen = (event: string, callback: any) => {
            if (event === WaitingRoomEvents.MatchRefused) callback('refused reason');
        };
        component.ngOnInit();
        expect(matDialogSpy.close).toHaveBeenCalled();
    });
});
