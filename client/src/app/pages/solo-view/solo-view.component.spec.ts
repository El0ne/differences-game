/* eslint-disable @typescript-eslint/no-explicit-any */
// CallBack function can be of any type and angular does not like it
/* eslint-disable max-lines */
// testing requires much more space and modules than allowed lines
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MAX_EFFECT_TIME } from '@app/components/click-event/click-event-constant';
import { ClickEventComponent } from '@app/components/click-event/click-event.component';
import { GameInfoModalComponent } from '@app/modals/game-info-modal/game-info-modal.component';
import { GameWinModalComponent } from '@app/modals/game-win-modal/game-win-modal.component';
import { QuitGameModalComponent } from '@app/modals/quit-game-modal/quit-game-modal.component';
import { ClickEventService } from '@app/services/click-event/click-event.service';
import { FoundDifferenceService } from '@app/services/found-differences/found-difference.service';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { SocketService } from '@app/services/socket/socket.service';
import { ChatEvents } from '@common/chat.gateway.events';
import { differenceInformation, playerDifference } from '@common/difference-information';
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
        foundDifferenceServiceSpy = jasmine.createSpyObj('FoundDifferenceService', [
            'addDifferenceFound',
            'clearDifferenceFound',
            'findPixelsFromDifference',
        ]);

        foundDifferenceServiceSpy.findPixelsFromDifference = (data: number[][]) => {
            const returnArray: number[] = [];
            for (const array of data) {
                for (const number of array) {
                    returnArray.push(number);
                }
            }
            return returnArray;
        };

        mockService = jasmine.createSpyObj('GameCardInformationService', ['getGameCardInfoFromId']);
        mockService.getGameCardInfoFromId = () => {
            return of(SERVICE_MOCK_GAME_CARD);
        };
        chatSocketServiceMock = jasmine.createSpyObj('SocketService', ['connect', 'disconnect', 'liveSocket', 'listen', 'send'], ['socketId']);
        chatSocketServiceMock.sio = jasmine.createSpyObj('Socket', ['on', 'emit', 'disconnect']);
        chatSocketServiceMock.names = new Map<string, string>();
        chatSocketServiceMock.names.set('playerId', 'player').set('opponentId', 'opponent');
        chatSocketServiceMock.gameRoom = 'game';
        chatSocketServiceMock.opponentSocket = 'opponentId';

        modalSpy = jasmine.createSpyObj('MatDialog', ['open']);

        chatSocketServiceMock.send = (event: string, data?: unknown) => {
            if (data) chatSocketServiceMock.sio.emit(event, data);
            return;
        };

        await TestBed.configureTestingModule({
            declarations: [SoloViewComponent, ClickEventComponent],
            imports: [FormsModule, HttpClientTestingModule, RouterTestingModule, MatIconModule, MatDialogModule, BrowserAnimationsModule],
            providers: [
                { provide: ClickEventService },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: Router, useValue: mockRouter },
                { provide: GameCardInformationService, useValue: mockService },
                { provide: SocketService, useValue: chatSocketServiceMock },
                { provide: FoundDifferenceService, useValue: foundDifferenceServiceSpy },
                { provide: MatDialog, useValue: modalSpy },
            ],
            teardown: { destroyAfterEach: false },
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
        Object.defineProperty(chatSocketServiceMock, 'socketId', { value: 'playerId' });
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
        chatSocketServiceMock.listen = (event: string, callback: any) => {
            switch (event) {
                case ChatEvents.WordValidated: {
                    callback({ isValidated: true, originalMessage: 'Test message' });
                    callback({ isValidated: false, originalMessage: 'Error message' });
                    break;
                }
                case ChatEvents.RoomMessage: {
                    callback({ socketId: 'test', message: 'Test message' });
                    break;
                }
                case ChatEvents.Abandon: {
                    callback({ socketId: 'abandon', message: 'abandon' });
                    break;
                }
                case ChatEvents.Difference: {
                    callback({ differenceInformation: { differencesPosition: 3, lastDifferences: [0, 1, 2] }, socketId: 'test' });
                    break;
                }
                case ChatEvents.Win: {
                    callback('test');
                    callback('wrong');
                    break;
                }
                // No default
            }
        };
        const listenSpy = spyOn(chatSocketServiceMock, 'listen').and.callThrough();
        const sendSpy = spyOn(chatSocketServiceMock, 'send').and.callThrough();
        const finishGameSpy = spyOn(component, 'winGame');
        Object.defineProperty(chatSocketServiceMock, 'socketId', { value: 'test' });
        component.configureSocketReactions();
        expect(listenSpy).toHaveBeenCalledTimes(5);
        expect(component.messages.length).toEqual(3);
        expect(sendSpy).toHaveBeenCalled();
        expect(component.messages[component.messages.length - 2].socketId).toEqual('test');
        expect(component.messages[component.messages.length - 1].socketId).toEqual('abandon');
        expect(finishGameSpy).toHaveBeenCalledWith(component.player);
        expect(finishGameSpy).toHaveBeenCalledWith('');
        expect(component.opponent).toBe('');
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

    it('should increment counter when increment counter to the correct person depending on socket id in multiplayer', () => {
        component.currentScorePlayer1 = 0;
        component.currentScorePlayer2 = 0;
        Object.defineProperty(chatSocketServiceMock, 'socketId', { value: 'mockSocket' });
        component.incrementScore('mockSocket');
        Object.defineProperty(chatSocketServiceMock, 'socketId', { value: 'opponent' });
        component.incrementScore('player');

        const answer = 1;

        expect(component.currentScorePlayer1).toEqual(answer);
        expect(component.currentScorePlayer2).toEqual(answer);
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
        component.openInfoModal();
        expect(modalSpy.open).toHaveBeenCalledWith(GameInfoModalComponent, {
            data: {
                gameCardInfo: component.gameCardInfo,
                numberOfDifferences: component.numberOfDifferences,
            },
        });
    });

    it('should open the quit game modal with disableClose set to true', () => {
        component.quitGame();
        expect(modalSpy.open).toHaveBeenCalledWith(QuitGameModalComponent, {
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

    it('effect handler should call all the correct handlers', () => {
        const handleFlashSpy = spyOn(component, 'handleFlash');
        const paintPixelSpy = spyOn(component, 'paintPixel');
        const incrementSpy = spyOn(component, 'incrementScore');
        const addDiffSpy = spyOn(component, 'addDifferenceDetected');
        const endGameVerifSpy = spyOn(component, 'endGameVerification');
        component.effectHandler(MOCK_PLAYER_DIFFERENCES);
        expect(handleFlashSpy).toHaveBeenCalledWith(MOCK_PLAYER_DIFFERENCES.differenceInformation.lastDifferences);
        expect(paintPixelSpy).toHaveBeenCalledWith(MOCK_PLAYER_DIFFERENCES.differenceInformation.lastDifferences);
        expect(incrementSpy).toHaveBeenCalledWith(MOCK_PLAYER_DIFFERENCES.socket);
        expect(addDiffSpy).toHaveBeenCalledWith(MOCK_PLAYER_DIFFERENCES.differenceInformation.differencesPosition);
        expect(endGameVerifSpy).toHaveBeenCalled();
    });

    it('difference handler should send event when a difference detected and emitsound in 1v1 mode', () => {
        component.currentRoom = 'room';
        spyOn(component.left, 'emitSound').and.callFake((difference: boolean) => {
            return difference;
        });
        const sendSpy = spyOn(chatSocketServiceMock, 'send').and.callThrough();
        component.differenceHandler(MOCK_INFORMATION);
        expect(sendSpy).toHaveBeenCalledWith(ChatEvents.Difference, MOCK_INFORMATION);
        expect(sendSpy).toHaveBeenCalledWith(ChatEvents.Event, { room: component.currentRoom, isMultiplayer: true, event: 'Différence trouvée' });
        expect(component.left.emitSound).toHaveBeenCalledWith(false);
    });

    it('difference handler should call the effect handler and send a general event when difference detected', () => {
        component.is1v1 = false;
        component.currentRoom = 'room';
        Object.defineProperty(chatSocketServiceMock, 'socketId', { value: 'mockSocket' });
        const sendSpy = spyOn(chatSocketServiceMock, 'send').and.callThrough();
        spyOn(component.left, 'emitSound').and.callFake((difference: boolean) => {
            return difference;
        });
        spyOn(component, 'effectHandler');
        component.differenceHandler(MOCK_INFORMATION);
        expect(sendSpy).toHaveBeenCalledWith(ChatEvents.Event, { room: component.currentRoom, isMultiplayer: false, event: 'Différence trouvée' });
        expect(component.left.emitSound).toHaveBeenCalledWith(false);
        const information: playerDifference = { differenceInformation: MOCK_INFORMATION, socket: chatSocketServiceMock.socketId };
        expect(component.effectHandler).toHaveBeenCalledWith(information);
    });

    it('endGameVerification should verify if currentScore of player is bigger than half \
    of the number of differences in multiplayer and send a win event if so', () => {
        component.numberOfDifferences = 4;
        component.currentScorePlayer1 = 2;
        component.currentRoom = 'win';
        const sendSpy = spyOn(chatSocketServiceMock, 'send').and.callThrough();
        component.endGameVerification();
        expect(sendSpy).toHaveBeenCalledWith(ChatEvents.Win, component.currentRoom);
    });

    it('endGameVerification should call winGame if currentScore of player is equal to number of differences', () => {
        component.currentScorePlayer1 = 2;
        component.numberOfDifferences = 2;
        component.is1v1 = false;
        const sendSpy = spyOn(chatSocketServiceMock, 'send').and.callThrough();
        spyOn(component, 'winGame');
        component.endGameVerification();
        expect(component.winGame).toHaveBeenCalled();
        expect(sendSpy).not.toHaveBeenCalled();
    });

    it('winGame should set all end game related boolean and open gameWin modal with true to multiplayer and winner name in multiplayer', () => {
        component.winGame('winner');
        expect(modalSpy.open).toHaveBeenCalledWith(GameWinModalComponent, { disableClose: true, data: { isSolo: false, winner: 'winner' } });
        expect(component.showNavBar).toBeFalse();
        expect(component.left.endGame).toBeTrue();
        expect(component.right.endGame).toBeTrue();
    });

    it('winGame should set all end game related boolean and open gameWin modal with false to multiplayer in solo', () => {
        component.is1v1 = false;
        component.winGame();
        expect(modalSpy.open).toHaveBeenCalledWith(GameWinModalComponent, { disableClose: true, data: { isSolo: true } });
        expect(component.showNavBar).toBeFalse();
        expect(component.left.endGame).toBeTrue();
        expect(component.right.endGame).toBeTrue();
    });

    it('invertDifferences should invert the toggleCheatMode attribute from left and right', () => {
        component.left.toggleCheatMode = true;
        component.right.toggleCheatMode = true;

        component.invertDifferences();

        expect(component.left.toggleCheatMode).toBeFalse();
        expect(component.right.toggleCheatMode).toBeFalse();
    });

    it('invertDifferences should invert the toggleCheatMode attribute from left and right', () => {
        component.left.toggleCheatMode = false;
        component.right.toggleCheatMode = false;

        component.invertDifferences();

        expect(component.left.toggleCheatMode).toBeTrue();
        expect(component.right.toggleCheatMode).toBeTrue();
    });

    it('resetDifferences should call activateCheatMode', fakeAsync(() => {
        component.left.toggleCheatMode = true;
        component.right.toggleCheatMode = true;
        const mockKeyEvent: KeyboardEvent = new KeyboardEvent('keydown', { key: 't' });
        const activateCheatModeSpy = spyOn(component, 'activateCheatMode');

        component.resetDifferences(mockKeyEvent);
        tick(MAX_EFFECT_TIME);
        expect(activateCheatModeSpy).toHaveBeenCalled();
    }));

    it('should call handleFlash when activateCheatMode is called', () => {
        const mockData = [[1, 2, 3], [4, 5], [6], [], [7, 8, 9]];
        spyOn(component.left.clickEventService, 'getDifferences').and.returnValue(of(mockData));
        const flashSpy = spyOn(component, 'handleFlash');

        const keyboardEvent = new KeyboardEvent('keydown', { key: 't' });

        foundDifferenceServiceSpy.foundDifferences = [];
        component.left.toggleCheatMode = false;
        component.right.toggleCheatMode = false;

        component.activateCheatMode(keyboardEvent);
        expect(flashSpy).toHaveBeenCalled();
    });

    it('activateCheatMode should be called with an array that contains all the differences', () => {
        const mockData = [[1, 2, 3], [4, 5], [6], [], [7, 8, 9]];
        spyOn(component.left.clickEventService, 'getDifferences').and.returnValue(of(mockData));
        const flashSpy = spyOn(component, 'handleFlash');
        const keyboardEvent = new KeyboardEvent('keydown', { key: 't' });

        foundDifferenceServiceSpy.foundDifferences = [];
        component.left.toggleCheatMode = false;
        component.right.toggleCheatMode = false;

        component.activateCheatMode(keyboardEvent);
        expect(flashSpy).toHaveBeenCalledWith([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
});

const MOCK_INFORMATION: differenceInformation = {
    lastDifferences: [0, 1, 2, 3],
    differencesPosition: 2,
};

const MOCK_PLAYER_DIFFERENCES: playerDifference = {
    differenceInformation: MOCK_INFORMATION,
    socket: 'test',
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
