/* eslint-disable no-underscore-dangle */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BestTimeComponent } from '@app/components/best-time/best-time.component';
import { GAMES } from '@app/mock/game-cards';
import { ChosePlayerNameDialogComponent } from '@app/modals/chose-player-name-dialog/chose-player-name-dialog.component';
import { WaitingRoomComponent, WaitingRoomDataPassing } from '@app/modals/waiting-room/waiting-room.component';
import { SocketService } from '@app/services/socket/socket.service';
import { JoinHostInWaitingRequest, WaitingRoomEvents } from '@common/waiting-room-socket-communication';
import { of } from 'rxjs';
import { GameCardSelectionComponent } from './game-card-selection.component';

describe('GameCardSelectionComponent', () => {
    let component: GameCardSelectionComponent;
    let fixture: ComponentFixture<GameCardSelectionComponent>;
    let modalSpy: MatDialog;
    let choseNameAfterClosedSpy: MatDialogRef<ChosePlayerNameDialogComponent>;
    let waitingRoomAfterClosedSpy: MatDialogRef<ChosePlayerNameDialogComponent>;
    let socketServiceSpy: SocketService;

    beforeEach(async () => {
        modalSpy = jasmine.createSpyObj('MatDialog', ['open']);
        choseNameAfterClosedSpy = jasmine.createSpyObj('MatDialogRef<ChosePlayerNameDialogComponent>', ['afterClosed']);
        choseNameAfterClosedSpy.afterClosed = () => of(undefined);

        waitingRoomAfterClosedSpy = jasmine.createSpyObj('MatDialogRef<WaitingRoomComponent>', ['afterClosed']);
        waitingRoomAfterClosedSpy.afterClosed = () => of();

        socketServiceSpy = jasmine.createSpyObj('SocketService', ['names', 'listen', 'delete', 'send', 'connect'], ['socketId']);
        socketServiceSpy.names = new Map<string, string>();

        await TestBed.configureTestingModule({
            declarations: [GameCardSelectionComponent, BestTimeComponent, ChosePlayerNameDialogComponent, WaitingRoomComponent],
            imports: [MatIconModule, RouterTestingModule],
            providers: [
                { provide: MatDialog, useValue: modalSpy },
                {
                    provide: SocketService,
                    useValue: socketServiceSpy,
                },
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

    it('selectPlayerName should redirect to solo view after opening the modal if in soloGame', () => {
        modalSpy.open = () => choseNameAfterClosedSpy;
        const routerSpy = spyOn(TestBed.inject(Router), 'navigate');
        component.selectPlayerName(true);
        expect(routerSpy).toHaveBeenCalledWith(['/solo/' + component.gameCardInformation._id]);
    });

    it('selectPlayerName should call hostOrJoinGame if in multiplayer', () => {
        modalSpy.open = () => choseNameAfterClosedSpy;
        const spy = spyOn(component, 'hostOrJoinGame').and.stub();
        component.selectPlayerName(false);
        expect(spy).toHaveBeenCalled();
    });

    it('hostOrJoinGame should send a hostGame event if the button is createButton', () => {
        component.createGameButton = true;
        component.hostOrJoinGame();
        expect(socketServiceSpy.send).toHaveBeenCalledWith(WaitingRoomEvents.HostGame, '123');
        expect(modalSpy.open).toHaveBeenCalledWith(WaitingRoomComponent, {
            disableClose: true,
            data: { stageId: '123', isHost: true } as WaitingRoomDataPassing,
        });
    });

    it('hostOrJoinGame should send a hostGame event if the button is createButton', () => {
        component.createGameButton = false;
        Object.defineProperty(socketServiceSpy, 'socketId', { value: 'playerId' });
        socketServiceSpy.names.set('playerId', 'playerName');
        component.hostOrJoinGame();
        expect(socketServiceSpy.send).toHaveBeenCalledWith(WaitingRoomEvents.JoinHost, {
            playerName: 'playerName',
            stageId: '123',
        } as JoinHostInWaitingRequest);
        expect(modalSpy.open).toHaveBeenCalledWith(WaitingRoomComponent, {
            disableClose: true,
            data: { stageId: '123', isHost: false } as WaitingRoomDataPassing,
        });
    });
});
