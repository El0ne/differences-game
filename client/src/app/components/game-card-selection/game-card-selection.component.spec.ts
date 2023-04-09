/* eslint-disable no-underscore-dangle */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BestTimeComponent } from '@app/components/best-time/best-time.component';
import { GAMES } from '@app/mock/game-cards';
import { ChosePlayerNameDialogComponent } from '@app/modals/chose-player-name-dialog/chose-player-name-dialog.component';
import { WaitingRoomComponent, WaitingRoomDataPassing } from '@app/modals/waiting-room/waiting-room.component';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { GameParametersService } from '@app/services/game-parameters/game-parameters.service';
import { SocketService } from '@app/services/socket/socket.service';
import { MATCH_EVENTS, SoloGameCreation } from '@common/match-gateway-communication';
import { JoinHostInWaitingRequest, WAITING_ROOM_EVENTS } from '@common/waiting-room-socket-communication';
import { of } from 'rxjs';
import { GameCardSelectionComponent } from './game-card-selection.component';

describe('GameCardSelectionComponent', () => {
    let component: GameCardSelectionComponent;
    let fixture: ComponentFixture<GameCardSelectionComponent>;
    const gameCardServiceSpyObj = jasmine.createSpyObj('GameCardInformationService', ['resetBestTime']);
    gameCardServiceSpyObj.resetBestTime.and.returnValue(of());
    let modalSpy: MatDialog;
    let choseNameAfterClosedSpy: MatDialogRef<ChosePlayerNameDialogComponent>;
    let waitingRoomAfterClosedSpy: MatDialogRef<ChosePlayerNameDialogComponent>;
    let socketServiceSpy: SocketService;
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
            declarations: [GameCardSelectionComponent, BestTimeComponent, ChosePlayerNameDialogComponent, WaitingRoomComponent],
            imports: [MatIconModule, RouterTestingModule, HttpClientTestingModule],
            providers: [
                { provide: MatDialog, useValue: modalSpy },
                {
                    provide: SocketService,
                    useValue: socketServiceSpy,
                },
                { provide: GameParametersService, useValue: gameParamService },
                { provide: GameCardInformationService, useValue: gameCardServiceSpyObj },
            ],
            teardown: { destroyAfterEach: false },
        }).compileComponents();

        fixture = TestBed.createComponent(GameCardSelectionComponent);
        component = fixture.componentInstance;
        component.gameCardInformation = GAMES[0];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('deleteGame should call socket send', () => {
        component.deleteGame();
        expect(socketServiceSpy.send).toHaveBeenCalledWith(WAITING_ROOM_EVENTS.DeleteGame, '123');
    });

    it('resetBestTimes() should call resetBestTime from the service', () => {
        component.resetBestTimes();

        expect(gameCardServiceSpyObj.resetBestTime).toHaveBeenCalled();
    });

    it('selectPlayerName should redirect to solo view after opening the modal if in soloGame', () => {
        modalSpy.open = () => choseNameAfterClosedSpy;
        const routerSpy = spyOn(TestBed.inject(Router), 'navigate');
        const isMultiplayer = false;
        component.selectPlayerName(isMultiplayer);
        expect(routerSpy).toHaveBeenCalledWith(['/game']);
        expect(gameParamService.gameParameters).toEqual({
            stageId: GAMES[0]._id,
            isLimitedTimeGame: false,
            isMultiplayerGame: isMultiplayer,
        });
        expect(socketServiceSpy.send).toHaveBeenCalledWith(MATCH_EVENTS.createSoloGame, {
            stageId: '123',
            isLimitedTimeMode: false,
        } as SoloGameCreation);
    });

    it('selectPlayerName should do nothing if isNameEntered is false', () => {
        modalSpy.open = () => choseNameAfterClosedSpy;
        const routerSpy = spyOn(TestBed.inject(Router), 'navigate');
        const hostOrJoinGameSpy = spyOn(component, 'hostOrJoinGame');
        const isMultiplayer = false;
        choseNameAfterClosedSpy.afterClosed = () => of(isMultiplayer);
        component.selectPlayerName(isMultiplayer);
        expect(routerSpy).not.toHaveBeenCalled();
        expect(hostOrJoinGameSpy).not.toHaveBeenCalled();
    });

    it('selectPlayerName should call hostOrJoinGame if in multiplayer', () => {
        modalSpy.open = () => choseNameAfterClosedSpy;
        const spy = spyOn(component, 'hostOrJoinGame').and.stub();
        component.selectPlayerName(true);
        expect(spy).toHaveBeenCalled();
    });

    it('hostOrJoinGame should send a hostGame event if the button is createButton', () => {
        component.createGameButton = true;
        component.hostOrJoinGame();
        expect(socketServiceSpy.send).toHaveBeenCalledWith(WAITING_ROOM_EVENTS.HostGame, '123');
        expect(modalSpy.open).toHaveBeenCalledWith(WaitingRoomComponent, {
            disableClose: true,
            data: { stageId: '123', isHost: true, isLimitedTimeMode: false } as WaitingRoomDataPassing,
        });
    });

    it('hostOrJoinGame should send a hostGame event if the button is createButton', () => {
        component.createGameButton = false;
        Object.defineProperty(socketServiceSpy, 'socketId', { value: 'playerId' });
        socketServiceSpy.names.set('playerId', 'playerName');
        component.hostOrJoinGame();
        expect(socketServiceSpy.send).toHaveBeenCalledWith(WAITING_ROOM_EVENTS.JoinHost, {
            playerName: 'playerName',
            stageId: '123',
        } as JoinHostInWaitingRequest);
        expect(modalSpy.open).toHaveBeenCalledWith(WaitingRoomComponent, {
            disableClose: true,
            data: { stageId: '123', isHost: false, isLimitedTimeMode: false } as WaitingRoomDataPassing,
        });
    });
});
