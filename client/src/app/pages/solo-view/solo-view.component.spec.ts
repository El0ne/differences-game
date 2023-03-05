/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ClickEventComponent } from '@app/components/click-event/click-event.component';
import { ChosePlayerNameDialogComponent } from '@app/modals/chose-player-name-dialog/chose-player-name-dialog.component';
import { GameInfoModalComponent } from '@app/modals/game-info-modal/game-info-modal.component';
import { QuitGameModalComponent } from '@app/modals/quit-game-modal/quit-game-modal.component';
import { ChatSocketService } from '@app/services/chat-socket/chat-socket.service';
import { ClickEventService } from '@app/services/click-event/click-event.service';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { differenceInformation } from '@common/difference-information';
import { GameCardInformation } from '@common/game-card';
import { of } from 'rxjs';
import { SoloViewComponent } from './solo-view.component';

describe('SoloViewComponent', () => {
    let component: SoloViewComponent;
    let fixture: ComponentFixture<SoloViewComponent>;
    let modalSpy: MatDialog;
    let afterClosedSpy: MatDialogRef<ChosePlayerNameDialogComponent>;
    let mockService: GameCardInformationService;
    let chatSocketServiceMock: ChatSocketService;
    const mockActivatedRoute = { snapshot: { paramMap: { get: () => '234' } } };
    const mockRouter = { url: '1v1/234' };

    beforeEach(async () => {
        mockService = jasmine.createSpyObj('GameCardInformationService', ['getGameCardInfoFromId']);
        mockService.getGameCardInfoFromId = () => {
            return of(SERVICE_MOCK_GAME_CARD);
        };
        chatSocketServiceMock = jasmine.createSpyObj('ChatSocketService', ['connect', 'disconnect', 'liveSocket', 'listen', 'send']);
        chatSocketServiceMock.sio = jasmine.createSpyObj('Socket', ['on', 'emit', 'disconnect']);
        // chatSocketServiceMock.sio.id = 'mockSocket';
        chatSocketServiceMock.names = ['player', 'opponent'];
        chatSocketServiceMock.gameRoom = 'game';

        chatSocketServiceMock.send = (event: string, data?: any) => {
            if (data) chatSocketServiceMock.sio.emit(event, data);
            return;
        };

        chatSocketServiceMock.listen = (event: string, callback: any) => {
            switch (event) {
                case 'wordValidated': {
                    callback({ validated: true, originalMessage: 'Test message' });
                    callback({ validated: false, originalMessage: 'Error message' });
                    break;
                }
                case 'roomMessage': {
                    callback({ socketId: 'test', message: 'Test message' });
                    break;
                }
                case 'event': {
                    callback({ socketId: 'test', message: 'Test message' });
                    callback({ socketId: 'mockSocket', message: 'Test message' });
                    break;
                }
                case 'hint': {
                    callback({ socketId: 'hint', message: 'Test message' });
                    break;
                }
                // No default
            }
        };

        modalSpy = jasmine.createSpyObj('MatDialog', ['open']);
        afterClosedSpy = jasmine.createSpyObj('MatDialogRef<ChosePlayerNameDialogComponent>', ['afterClosed']);
        afterClosedSpy.afterClosed = () => {
            return of();
        };

        modalSpy.open = () => afterClosedSpy;

        await TestBed.configureTestingModule({
            declarations: [SoloViewComponent, ClickEventComponent, ChosePlayerNameDialogComponent],
            imports: [FormsModule, HttpClientTestingModule, RouterTestingModule, MatIconModule, MatDialogModule],
            providers: [
                { provide: ClickEventService },
                { provide: MatDialog, useValue: modalSpy },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: Router, useValue: mockRouter },
                { provide: GameCardInformationService, useValue: mockService },
                { provide: ChatSocketService, useValue: chatSocketServiceMock },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(SoloViewComponent);
        component = fixture.componentInstance;
        component.messages = [];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set the current gameCard id according to value in route and request gameCard as well as game player information', () => {
        spyOn(component.dialog, 'open').and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<ChosePlayerNameDialogComponent>);
        const showTimeSpy = spyOn(component, 'showTime');
        const configureSocketReactionsSpy = spyOn(component, 'configureSocketReactions');
        component.ngOnInit();
        expect(component.currentGameId).toEqual('234');
        expect(component.is1v1).toBe(true);
        expect(component.gameCardInfo).toBe(SERVICE_MOCK_GAME_CARD);
        expect(component.numberOfDifferences).toEqual(SERVICE_MOCK_GAME_CARD.differenceNumber);
        expect(component.player).toEqual('player');
        expect(component.opponent).toEqual('opponent');
        expect(component.currentRoom).toEqual('game');
        expect(showTimeSpy).toHaveBeenCalled();
        expect(configureSocketReactionsSpy).toHaveBeenCalled();
    });

    it('ConfigureSocketReactions should configure sockets correctly & react properly according to event', () => {
        const listenSpy = spyOn(chatSocketServiceMock, 'listen').and.callThrough();
        const sendSpy = spyOn(chatSocketServiceMock, 'send').and.callThrough();
        chatSocketServiceMock.sio.id = 'mockSocket';
        component.configureSocketReactions();
        expect(listenSpy).toHaveBeenCalledTimes(4);
        expect(component.messages.length).toEqual(5);
        expect(sendSpy).toHaveBeenCalled();
        expect(component.messages[component.messages.length - 1].socketId).toEqual('hint');
        expect(component.messages[component.messages.length - 2].socketId).toEqual('event');
    });

    it('handleMistake should send an event called event to socket server with extra information', () => {
        component.currentRoom = 'room';
        const sendSpy = spyOn(chatSocketServiceMock, 'send').and.callThrough();
        component.handleMistake();
        expect(sendSpy).toHaveBeenCalledWith('event', { room: component.currentRoom, multiplayer: true, event: 'Erreur' });
    });

    it('hint should send a hint event to socket server with the room information', () => {
        component.currentRoom = 'room';
        const sendSpy = spyOn(chatSocketServiceMock, 'send').and.callThrough();
        component.hint();
        expect(sendSpy).toHaveBeenCalledWith('hint', component.currentRoom);
    });

    it('sendMessage should validate message on the server', () => {
        const sendSpy = spyOn(chatSocketServiceMock, 'send').and.callThrough();
        component.messageContent = 'test message';
        component.sendMessage();
        expect(sendSpy).toHaveBeenCalledWith('validate', 'test message');
        expect(component.messageContent).toBe('');
    });

    it('get SocketId() should return the socketId if valid', () => {
        const socketId = component.socketId;
        expect(socketId).toEqual(component['socketId']);
        chatSocketServiceMock.sio.id = 'mockSocket';
        expect(component['socketId']).toEqual('mockSocket');
    });

    it('should increment counter when increment counter is called', () => {
        component.currentScorePlayer1 = 0;
        component.incrementScore();
        const answer = 1;

        expect(component.currentScorePlayer1).toEqual(answer);
    });

    it('finishGame should have been called if number of errors is equal to the current score in incrementScore', () => {
        const finishGameSpy = spyOn(component, 'finishGame');
        component.currentScorePlayer1 = 1;
        component.numberOfDifferences = 2;
        component.incrementScore();
        expect(finishGameSpy).toHaveBeenCalled();
    });

    it('finishGame should set showNavBar to false and showWinScreen to true', () => {
        component.showNavBar = true;
        component.showWinMessage = false;
        component.finishGame();
        expect(component.showNavBar).toBeFalse();
        expect(component.showWinMessage).toBeTrue();
    });

    it('showTime should call startTimer of service', () => {
        const startTimerSpy = spyOn(component.timerService, 'startTimer');

        component.showTime();

        expect(startTimerSpy).toHaveBeenCalled();
    });

    it('addDifferenceDetected should call addDifferenceFound of service', () => {
        const addDiffSpy = spyOn(component.foundDifferenceService, 'addDifferenceFound');

        component.addDifferenceDetected(1);

        expect(addDiffSpy).toHaveBeenCalled();
    });

    it('should open the game info modal with the correct data', () => {
        const spy = spyOn(modalSpy, 'open').and.callThrough();
        component.openInfoModal();
        expect(spy).toHaveBeenCalledWith(GameInfoModalComponent, {
            data: {
                gameCardInfo: component.gameCardInfo,
                numberOfDifferences: component.numberOfDifferences,
            },
        });
    });

    it('should open the quit game modal with disableClose set to true', () => {
        const spy = spyOn(modalSpy, 'open').and.callThrough();
        component.quitGame();
        expect(spy).toHaveBeenCalledWith(QuitGameModalComponent, {
            disableClose: true,
            data: { player: component.player, room: component.currentRoom },
        });
    });

    it('paintPixel should call sendPixels and receivePixels properly', () => {
        const leftCanvasSpy = spyOn(component.left, 'sendDifferencePixels');
        const rightCanvasSpy = spyOn(component.right, 'receiveDifferencePixels');

        component.paintPixel([1]);

        expect(leftCanvasSpy).toHaveBeenCalled();
        expect(rightCanvasSpy).toHaveBeenCalled();
    });

    it('handleFlash() should canvas functions to emit difference effect', () => {
        const leftCanvasSpy = spyOn(component.left, 'differenceEffect');
        const rightCanvasSpy = spyOn(component.right, 'differenceEffect');

        component.handleFlash([0]);

        expect(leftCanvasSpy).toHaveBeenCalled();
        expect(rightCanvasSpy).toHaveBeenCalled();
    });

    it('emit handler should call all the correct handlers', () => {
        const handleFlashSpy = spyOn(component, 'handleFlash');
        const paintPixelSpy = spyOn(component, 'paintPixel');
        const incrementSpy = spyOn(component, 'incrementScore');
        const addDiffSpy = spyOn(component, 'addDifferenceDetected');
        component.emitHandler(MOCK_INFORMATION);
        expect(handleFlashSpy).toHaveBeenCalled();
        expect(paintPixelSpy).toHaveBeenCalled();
        expect(incrementSpy).toHaveBeenCalled();
        expect(addDiffSpy).toHaveBeenCalled();
    });
});

const MOCK_INFORMATION: differenceInformation = {
    lastDifferences: [0, 1, 2, 3],
    differencesPosition: 2,
};

const SERVICE_MOCK_GAME_CARD: GameCardInformation = {
    _id: '0',
    name: 'game',
    difficulty: 'Facile',
    differenceNumber: 7,
    originalImageName: 'game.baseImage',
    differenceImageName: 'game.differenceImage',
    soloTimes: [
        { time: 0, name: '--' },
        { time: 0, name: '--' },
        { time: 0, name: '--' },
    ],
    multiTimes: [
        { time: 0, name: '--' },
        { time: 0, name: '--' },
        { time: 0, name: '--' },
    ],
};
