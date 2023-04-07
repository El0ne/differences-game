import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketService } from '@app/services/socket/socket.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatIconModule } from '@angular/material/icon';
import { ChosePlayerNameDialogComponent } from '@app/modals/chose-player-name-dialog/chose-player-name-dialog.component';
import { GameParametersService } from '@app/services/game-parameters/game-parameters.service';
import { LIMITED_TIME_MODE_EVENTS, MATCH_EVENTS, SoloGameCreation } from '@common/match-gateway-communication';
import { JoinHostInWaitingRequest, WAITING_ROOM_EVENTS } from '@common/waiting-room-socket-communication';
import { of } from 'rxjs';
import { LIMITED_TIME_MODE_ID, LimitedTimeComponent } from './limited-time.component';

describe('LimitedTimeComponent', () => {
    let component: LimitedTimeComponent;
    let fixture: ComponentFixture<LimitedTimeComponent>;
    let socketServiceSpy: SocketService;
    let modalSpy: MatDialog;
    let choseNameAfterClosedSpy: MatDialogRef<ChosePlayerNameDialogComponent>;
    let waitingRoomAfterClosedSpy: MatDialogRef<ChosePlayerNameDialogComponent>;
    let gameParamService: GameParametersService;

    beforeEach(async () => {
        modalSpy = jasmine.createSpyObj('MatDialog', ['open']);
        choseNameAfterClosedSpy = jasmine.createSpyObj('MatDialogRef<ChosePlayerNameDialogComponent>', ['afterClosed']);
        choseNameAfterClosedSpy.afterClosed = () => of(true);
        waitingRoomAfterClosedSpy = jasmine.createSpyObj('MatDialogRef<WaitingRoomComponent>', ['afterClosed']);
        waitingRoomAfterClosedSpy.afterClosed = () => of();
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['names', 'listen', 'delete', 'send', 'connect'], ['socketId']);
        socketServiceSpy.names = new Map<string, string>();
        gameParamService = jasmine.createSpyObj('GameParametersService', ['gameParameters']);
        await TestBed.configureTestingModule({
            declarations: [LimitedTimeComponent],
            imports: [RouterTestingModule, MatDialogModule, MatIconModule, HttpClientTestingModule],
            providers: [
                { provide: MatDialog, useValue: modalSpy },
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: GameParametersService, useValue: gameParamService },
                { provide: SocketService, useValue: socketServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(LimitedTimeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('selectPlayerName should do nothing afterClose if isNameEntered is false', () => {
        choseNameAfterClosedSpy.afterClosed = () => of(false);

        gameParamService.gameParameters = { isLimitedTimeGame: false, isMultiplayerGame: false, stageId: 'noToBeChanged' };
        modalSpy.open = () => choseNameAfterClosedSpy;
        component.selectPlayerName(true);
        expect(gameParamService.gameParameters.isLimitedTimeGame).toBe(false);
        expect(gameParamService.gameParameters.stageId).toBe('noToBeChanged');
    });

    it('selectPlayerName should set the gameParameters if isNameEntered is true and call hostOrJoinGame if isMultiplayer', () => {
        choseNameAfterClosedSpy.afterClosed = () => of(true);
        spyOn(component, 'hostOrJoinGame').and.returnValue();
        modalSpy.open = () => choseNameAfterClosedSpy;
        component.selectPlayerName(true);
        expect(gameParamService.gameParameters.isLimitedTimeGame).toEqual(true);
        expect(gameParamService.gameParameters.isMultiplayerGame).toEqual(true);
        expect(component.hostOrJoinGame).toHaveBeenCalled();
    });

    it('selectPlayerName should set the gameParameters if isNameEntered is true and send a CreateSolo game event if is solo', () => {
        modalSpy.open = () => choseNameAfterClosedSpy;
        component.selectPlayerName(false);
        expect(gameParamService.gameParameters.isLimitedTimeGame).toEqual(true);
        expect(gameParamService.gameParameters.isMultiplayerGame).toEqual(false);
        expect(socketServiceSpy.send).toHaveBeenCalledWith(MATCH_EVENTS.createSoloGame, {
            stageId: LIMITED_TIME_MODE_ID,
            isLimitedTimeMode: true,
        } as SoloGameCreation);
    });

    it('hostOrJoinGame should open the waitingRoom dialog a send the good event depending on createGameButton', () => {
        modalSpy.open = () => waitingRoomAfterClosedSpy;
        component.createGameButton = true;
        component.hostOrJoinGame();
        expect(socketServiceSpy.send).toHaveBeenCalledWith(WAITING_ROOM_EVENTS.HostGame, LIMITED_TIME_MODE_ID);
        // expect(modalSpy.open).toHaveBeenCalledWith(WaitingRoomComponent, {
        //     disableClose: true,
        //     data: { stageId: LIMITED_TIME_MODE_ID, isHost: true, isLimitedTimeMode: true } as WaitingRoomDataPassing,
        // });

        component.createGameButton = false;
        Object.defineProperty(socketServiceSpy, 'socketId', { value: 'playerId' });
        socketServiceSpy.names.set('playerId', 'playerName');
        component.hostOrJoinGame();
        expect(socketServiceSpy.send).toHaveBeenCalledWith(WAITING_ROOM_EVENTS.JoinHost, {
            playerName: 'playerName',
            stageId: LIMITED_TIME_MODE_ID,
        } as JoinHostInWaitingRequest);
        // expect(modalSpy.open).toHaveBeenCalledWith(WaitingRoomComponent, {
        //     disableClose: true,
        //     data: { stageId: LIMITED_TIME_MODE_ID, isHost: false, isLimitedTimeMode: true } as WaitingRoomDataPassing,
        // });
    });

    it('ngOnDestroy should delete the listeners', () => {
        component.ngOnDestroy();
        expect(socketServiceSpy.delete).toHaveBeenCalledWith(WAITING_ROOM_EVENTS.MatchCreated);
        expect(socketServiceSpy.delete).toHaveBeenCalledWith(WAITING_ROOM_EVENTS.MatchDeleted);
        expect(socketServiceSpy.delete).toHaveBeenCalledWith(LIMITED_TIME_MODE_EVENTS.StartLimitedTimeGame);
    });
});
