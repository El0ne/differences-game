/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketService } from '@app/services/socket/socket.service';
import {
    AcceptOpponentInformation,
    AcceptationInformation,
    PlayerInformations,
    WAITING_ROOM_EVENTS,
} from '@common/waiting-room-socket-communication';
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
                { provide: MAT_DIALOG_DATA, useValue: { stageId: '123', isHost: true, isLimitedTimeMode: false } as WaitingRoomDataPassing },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(WaitingRoomComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.waitingRoomInfo).toEqual({ stageId: '123', isHost: true, isLimitedTimeMode: false });
    });

    it('all listeners should be removed at the destor of the dialog', () => {
        socketServiceSpy.connect();
        component.ngOnDestroy();
        expect(socketServiceSpy.delete).toHaveBeenCalledWith(WAITING_ROOM_EVENTS.RequestMatch);
        expect(socketServiceSpy.delete).toHaveBeenCalledWith(WAITING_ROOM_EVENTS.UnrequestMatch);
        expect(socketServiceSpy.delete).toHaveBeenCalledWith(WAITING_ROOM_EVENTS.MatchConfirmed);
        component.waitingRoomInfo.isHost = false;
        component.ngOnInit();
        component.ngOnDestroy();
        expect(socketServiceSpy.delete).toHaveBeenCalledWith(WAITING_ROOM_EVENTS.MatchAccepted);
        expect(socketServiceSpy.delete).toHaveBeenCalledWith(WAITING_ROOM_EVENTS.MatchRefused);
    });

    it('handleCancel shoul emit the right event depending on isHost', () => {
        component.handleCancel();
        expect(matDialogSpy.close).toHaveBeenCalled();
        expect(socketServiceSpy.send).toHaveBeenCalledWith(WAITING_ROOM_EVENTS.UnhostGame);

        component.waitingRoomInfo.isHost = false;
        component.handleCancel();
        expect(socketServiceSpy.send).toHaveBeenCalledWith(WAITING_ROOM_EVENTS.QuitHost);
    });

    it('navigateToMultiplayer should close the dialog and navigate to the right game', () => {
        component.navigateToMultiplayer('gameRoom');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/multiplayer/123']);
    });

    it('acceptOpponent should send an acceptOpponent event and add the opponent name to the map', () => {
        component.clientsInWaitingRoom.set('opponentId', 'testName');
        spyOn(socketServiceSpy.names, 'set').and.callThrough();
        socketServiceSpy.names.set('socketId', 'myName');
        Object.defineProperty(socketServiceSpy, 'socketId', { value: 'socketId' });
        component.acceptOpponent('opponentId');
        expect(socketServiceSpy.names.set).toHaveBeenCalledWith('opponentId', 'testName');
        const expectedAcceptRequest: AcceptOpponentInformation = { playerName: 'myName', playerSocketId: 'opponentId', isLimitedTimeMode: false };
        expect(socketServiceSpy.send).toHaveBeenCalledWith(WAITING_ROOM_EVENTS.AcceptOpponent, expectedAcceptRequest);
    });

    it('declineOpponent should send the envent to the refused opponent and remove him from the opponents map', () => {
        component.clientsInWaitingRoom.set('opponentId', 'testName');
        component.declineOpponent('opponentId');
        expect(component.clientsInWaitingRoom.has('opponentId')).toBeFalsy();
        expect(socketServiceSpy.send).toHaveBeenCalledWith(WAITING_ROOM_EVENTS.DeclineOpponent, 'opponentId');
    });

    it('a requestMatch event should add the opponent to the map', () => {
        socketServiceSpy.listen = (event: string, callback: any) => {
            if (event === WAITING_ROOM_EVENTS.RequestMatch) callback({ playerName: 'testName', playerSocketId: 'opponentId' } as PlayerInformations);
        };
        component.ngOnInit();
        expect(component.clientsInWaitingRoom.get('opponentId')).toEqual('testName');
    });

    it('a unrequestMatch event should remove opponent to the map', () => {
        component.clientsInWaitingRoom.set('opponentId', 'nom');
        socketServiceSpy.listen = (event: string, callback: any) => {
            if (event === WAITING_ROOM_EVENTS.UnrequestMatch) callback('opponentId');
        };
        component.ngOnInit();
        expect(component.clientsInWaitingRoom.has('opponentId')).toBeFalsy();
    });

    it('Match confirmed should redirect the host to the game', () => {
        spyOn(component, 'navigateToMultiplayer').and.callThrough();
        socketServiceSpy.listen = (event: string, callback: any) => {
            if (event === WAITING_ROOM_EVENTS.MatchConfirmed) callback('opponentId');
        };
        component.ngOnInit();
        expect(component.navigateToMultiplayer).toHaveBeenCalled();
    });

    it('matchAccepted event should add the gameHost to the map and redirect to the game', () => {
        spyOn(component, 'navigateToMultiplayer').and.callThrough();
        component.clientsInWaitingRoom.set('opponentId', 'nom');
        component.waitingRoomInfo.isHost = false;
        socketServiceSpy.listen = (event: string, callback: any) => {
            if (event === WAITING_ROOM_EVENTS.MatchAccepted)
                callback({ playerName: 'hostName', playerSocketId: 'hostId', roomId: 'roomId' } as AcceptationInformation);
        };
        component.ngOnInit();
        expect(socketServiceSpy.names.get('hostId')).toEqual('hostName');
        expect(component.navigateToMultiplayer).toHaveBeenCalled();
    });

    it('matchRefused event should alert the player and close the dialog', () => {
        spyOn(window, 'alert').and.callFake(() => {
            return;
        });
        socketServiceSpy.listen = (event: string, callback: any) => {
            if (event === WAITING_ROOM_EVENTS.MatchRefused) callback('refused reason');
        };
        component.waitingRoomInfo.isHost = false;
        component.ngOnInit();
        expect(matDialogSpy.close).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith('refused reason');
        component.waitingRoomInfo.isHost = true;
        component.ngOnInit();
        expect(matDialogSpy.close).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith('refused reason');
    });
});
