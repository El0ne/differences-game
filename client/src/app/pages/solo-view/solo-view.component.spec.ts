/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ClickEventComponent } from '@app/components/click-event/click-event.component';
import { GameInfoModalComponent } from '@app/modals/game-info-modal/game-info-modal.component';
import { QuitGameModalComponent } from '@app/modals/quit-game-modal/quit-game-modal.component';
import { ClickEventService } from '@app/services/click-event/click-event.service';
import { FoundDifferenceService } from '@app/services/found-differences/found-difference.service';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { SocketService } from '@app/services/socket/socket.service';
import { differenceInformation } from '@common/difference-information';
import { GameCardInformation } from '@common/game-card';
import { of } from 'rxjs';
import { SoloViewComponent } from './solo-view.component';

describe('SoloViewComponent', () => {
    let component: SoloViewComponent;
    let fixture: ComponentFixture<SoloViewComponent>;
    let mockService: GameCardInformationService;
    let chatSocketServiceMock: SocketService;
    let foundDifferenceServiceSpy: FoundDifferenceService;
    let modalSpy: MatDialog;

    const mockActivatedRoute = { snapshot: { paramMap: { get: () => '234' } } };
    const mockRouter = { url: '1v1/234' };

    beforeEach(async () => {
        foundDifferenceServiceSpy = jasmine.createSpyObj('FoundDifferenceService', ['addDifferenceFound', 'clearDifferenceFound']);

        mockService = jasmine.createSpyObj('GameCardInformationService', ['getGameCardInfoFromId']);
        mockService.getGameCardInfoFromId = () => {
            return of(SERVICE_MOCK_GAME_CARD);
        };
        chatSocketServiceMock = jasmine.createSpyObj('SocketService', ['connect', 'disconnect', 'liveSocket', 'listen', 'send']);
        chatSocketServiceMock.sio = jasmine.createSpyObj('Socket', ['on', 'emit', 'disconnect']);
        chatSocketServiceMock.names = new Map<string, string>();
        chatSocketServiceMock.names.set('playerId', 'player').set('opponentId', 'opponent');
        chatSocketServiceMock.gameRoom = 'game';

        chatSocketServiceMock.send = (event: string, data?: any) => {
            if (data) chatSocketServiceMock.sio.emit(event, data);
            return;
        };

        chatSocketServiceMock.listen = (event: string, callback: any) => {
            switch (event) {
                case 'wordValidated': {
                    callback({ isValidated: true, originalMessage: 'Test message' });
                    callback({ isValidated: false, originalMessage: 'Error message' });
                    break;
                }
                case 'roomMessage': {
                    callback({ socketId: 'test', message: 'Test message' });
                    break;
                }
                case 'abandon': {
                    callback({ socketId: 'abandon', message: 'abandon' });
                }
                // No default
            }
        };

        await TestBed.configureTestingModule({
            declarations: [SoloViewComponent, ClickEventComponent],
            imports: [FormsModule, HttpClientTestingModule, RouterTestingModule, MatIconModule, MatDialogModule],
            providers: [
                { provide: ClickEventService },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: Router, useValue: mockRouter },
                { provide: GameCardInformationService, useValue: mockService },
                { provide: SocketService, useValue: chatSocketServiceMock },
                { provide: FoundDifferenceService, useValue: foundDifferenceServiceSpy },
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
        const finishGameSpy = spyOn(component, 'finishGame');
        chatSocketServiceMock.sio.id = 'mockSocket';
        component.configureSocketReactions();
        expect(listenSpy).toHaveBeenCalledTimes(3);
        expect(component.messages.length).toEqual(3);
        expect(sendSpy).toHaveBeenCalled();
        expect(component.messages[component.messages.length - 2].socketId).toEqual('test');
        expect(component.messages[component.messages.length - 1].socketId).toEqual('abandon');
        expect(finishGameSpy).toHaveBeenCalled();
    });

    it('handleMistake should send an event called event to socket server with extra information', () => {
        component.currentRoom = 'room';
        const sendSpy = spyOn(chatSocketServiceMock, 'send').and.callThrough();
        component.handleMistake();
        expect(sendSpy).toHaveBeenCalledWith('event', { room: component.currentRoom, isMultiplayer: true, event: 'Erreur' });
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
        component.addDifferenceDetected(1);

        expect(foundDifferenceServiceSpy.addDifferenceFound).toHaveBeenCalled();
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
