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
import { GameConstantsService } from '@app/services/game-constants/game-constants.service';
import { SocketService } from '@app/services/socket/socket.service';
import { CHAT_EVENTS } from '@common/chat-gateway-events';
import { DifferenceInformation, PlayerDifference } from '@common/difference-information';
import { GameCardInformation } from '@common/game-card';
import { GameConstants } from '@common/game-constants';
import { GameHistoryDTO } from '@common/game-history.dto';
import { MATCH_EVENTS, ONE_SECOND } from '@common/match-gateway-communication';
import { of } from 'rxjs';
import { SoloViewComponent } from './solo-view.component';

describe('SoloViewComponent', () => {
    let component: SoloViewComponent;
    let fixture: ComponentFixture<SoloViewComponent>;
    let mockService: GameCardInformationService;
    let socketServiceMock: SocketService;
    let foundDifferenceServiceSpy: FoundDifferenceService;
    let modalSpy: MatDialog;
    let clickEventServiceSpy: ClickEventService;
    let gameConstantsService: GameConstantsService;

    const mockActivatedRoute = { snapshot: { paramMap: { get: () => '234' } } };
    let mockRouter: Router;

    beforeEach(async () => {
        clickEventServiceSpy = jasmine.createSpyObj<ClickEventService>('ClickEventService', ['getDifferences', 'isADifference', 'getDifferences']);
        clickEventServiceSpy.getDifferences = () => of([[1, 2, 3], [4, 5], [6], [], [7, 8, 9]]);

        mockRouter = jasmine.createSpyObj<Router>('Router', ['navigate'], ['url']);
        Object.defineProperty(mockRouter, 'url', { value: 'multiplayer/234' });

        foundDifferenceServiceSpy = jasmine.createSpyObj('FoundDifferenceService', [
            'addDifferenceFound',
            'clearDifferenceFound',
            'findPixelsFromDifference',
        ]);
        gameConstantsService = jasmine.createSpyObj('GameConstantService', ['getGameConstants']);
        gameConstantsService.getGameConstants = () => {
            return of(MOCK_GAME_CONSTANTS);
        };
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
        socketServiceMock = jasmine.createSpyObj('SocketService', ['connect', 'disconnect', 'liveSocket', 'listen', 'send'], ['socketId']);
        socketServiceMock.sio = jasmine.createSpyObj('Socket', ['on', 'emit', 'disconnect']);
        socketServiceMock.names = new Map<string, string>();
        socketServiceMock.names.set('playerId', 'player').set('opponentId', 'opponent');
        socketServiceMock.gameRoom = 'room';
        socketServiceMock.opponentSocket = 'opponentId';
        socketServiceMock.liveSocket = () => true;

        modalSpy = jasmine.createSpyObj('MatDialog', ['open']);

        socketServiceMock.send = (event: string, data?: unknown) => {
            if (data) socketServiceMock.sio.emit(event, data);
            return;
        };

        await TestBed.configureTestingModule({
            declarations: [SoloViewComponent, ClickEventComponent],
            imports: [FormsModule, HttpClientTestingModule, RouterTestingModule, MatIconModule, MatDialogModule, BrowserAnimationsModule],
            providers: [
                { provide: ClickEventService, useValue: clickEventServiceSpy },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: Router, useValue: mockRouter },
                { provide: GameCardInformationService, useValue: mockService },
                { provide: SocketService, useValue: socketServiceMock },
                { provide: FoundDifferenceService, useValue: foundDifferenceServiceSpy },
                { provide: MatDialog, useValue: modalSpy },
                { provide: GameConstantsService, useValue: gameConstantsService },
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

    it("ngOnInit should redirect to the home page if the socket isn't connected", () => {
        spyOn(socketServiceMock, 'liveSocket').and.returnValue(false);
        component.ngOnInit();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('ngOnInit should prepare an eventual abandon case if in solo mode ', fakeAsync(() => {
        Object.defineProperty(mockRouter, 'url', { value: 'solo/234' });
        const sendSpy = spyOn(socketServiceMock, 'send').and.callThrough();
        component.ngOnInit();
        tick(ONE_SECOND);
        expect(sendSpy).toHaveBeenCalledTimes(2);
        expect(component.soloTimer).toBeTruthy();
        expect(component.gameConstants).toEqual(MOCK_GAME_CONSTANTS);
        clearInterval(component.soloTimer);
    }));

    it('should set the current gameCard id according to value in route and request gameCard as well as game player information', () => {
        const showTimeSpy = spyOn(component, 'showTime');
        const configureSocketReactionsSpy = spyOn(component, 'configureSocketReactions');
        Object.defineProperty(socketServiceMock, 'socketId', { value: 'playerId' });
        component.ngOnInit();
        expect(component.stageId).toEqual('234');
        expect(component.isMultiplayer).toBe(true);
        expect(component.gameCardInfo).toBe(SERVICE_MOCK_GAME_CARD);
        expect(component.numberOfDifferences).toEqual(SERVICE_MOCK_GAME_CARD.differenceNumber);
        expect(component.player).toEqual('player');
        expect(component.opponent).toEqual('opponent');
        expect(showTimeSpy).toHaveBeenCalled();
        expect(configureSocketReactionsSpy).toHaveBeenCalled();
    });

    it('ConfigureSocketReactions should configure sockets correctly & react properly according to event', () => {
        socketServiceMock.listen = (event: string, callback: any) => {
            switch (event) {
                case CHAT_EVENTS.WordValidated: {
                    callback({ isValidated: true, originalMessage: 'Test message' });
                    callback({ isValidated: false, originalMessage: 'Error message' });
                    break;
                }
                case CHAT_EVENTS.RoomMessage: {
                    callback({ socketId: 'test', message: 'Test message' });
                    break;
                }
                case CHAT_EVENTS.Abandon: {
                    callback({ socketId: 'abandon', message: 'abandon' });
                    break;
                }
                case MATCH_EVENTS.Difference: {
                    callback({ lastDifferences: [0, 1, 2, 3], differencesPosition: 2, socketId: 'test' });
                    break;
                }
                case MATCH_EVENTS.Win: {
                    callback('test');
                    callback('wrong');
                    break;
                }
                // No default
            }
        };
        const listenSpy = spyOn(socketServiceMock, 'listen').and.callThrough();
        const sendSpy = spyOn(socketServiceMock, 'send').and.callThrough();
        const finishGameSpy = spyOn(component, 'winGame');
        Object.defineProperty(socketServiceMock, 'socketId', { value: 'test' });
        component.configureSocketReactions();
        expect(listenSpy).toHaveBeenCalledTimes(5);
        expect(component.messages.length).toEqual(3);
        expect(sendSpy).toHaveBeenCalled();
        expect(component.messages[component.messages.length - 2].socketId).toEqual('test');
        expect(component.messages[component.messages.length - 1].socketId).toEqual('abandon');
        expect(finishGameSpy).toHaveBeenCalledWith('test');
        expect(finishGameSpy).toHaveBeenCalledWith('wrong');
    });

    it('handleMistake should send an event called event to socket server with extra information', () => {
        const sendSpy = spyOn(socketServiceMock, 'send').and.callThrough();
        component.handleMistake();
        expect(sendSpy).toHaveBeenCalledWith('event', { room: 'room', isMultiplayer: true, event: 'Erreur' });
    });

    it('hint should send a hint event to socket server with the room information', () => {
        const sendSpy = spyOn(socketServiceMock, 'send').and.callThrough();
        component.hint();
        expect(sendSpy).toHaveBeenCalledWith('hint', 'room');
    });

    it('sendMessage should validate message on the server', () => {
        const sendSpy = spyOn(socketServiceMock, 'send').and.callThrough();
        component.messageContent = 'test message';
        component.sendMessage();
        expect(sendSpy).toHaveBeenCalledWith('validate', 'test message');
        expect(component.messageContent).toBe('');
    });

    it('should increment counter when increment counter to the correct person depending on socket id in multiplayer', () => {
        component.currentScorePlayer = 0;
        component.currentScoreOpponent = 0;
        Object.defineProperty(socketServiceMock, 'socketId', { value: 'mockSocket' });
        component.incrementScore('mockSocket');
        Object.defineProperty(socketServiceMock, 'socketId', { value: 'opponent' });
        component.incrementScore('player');

        const answer = 1;

        expect(component.currentScorePlayer).toEqual(answer);
        expect(component.currentScoreOpponent).toEqual(answer);
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
        component.isMultiplayer = true;
        component.openInfoModal();
        expect(modalSpy.open).toHaveBeenCalledWith(GameInfoModalComponent, {
            data: {
                gameCardInfo: component.gameCardInfo,
                numberOfDifferences: component.numberOfDifferences,
                numberOfPlayers: 2,
            },
        });
    });

    it('should open the game info modal with the correct data', () => {
        component.isMultiplayer = false;
        component.openInfoModal();
        expect(modalSpy.open).toHaveBeenCalledWith(GameInfoModalComponent, {
            data: {
                gameCardInfo: component.gameCardInfo,
                numberOfDifferences: component.numberOfDifferences,
                numberOfPlayers: 1,
            },
        });
    });

    it('should open the quit game modal with disableClose set to true', () => {
        component.quitGame();
        expect(modalSpy.open).toHaveBeenCalledWith(QuitGameModalComponent, {
            disableClose: true,
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
        expect(handleFlashSpy).toHaveBeenCalledWith(MOCK_PLAYER_DIFFERENCES.lastDifferences);
        expect(paintPixelSpy).toHaveBeenCalledWith(MOCK_PLAYER_DIFFERENCES.lastDifferences);
        expect(incrementSpy).toHaveBeenCalledWith(MOCK_PLAYER_DIFFERENCES.socket);
        expect(addDiffSpy).toHaveBeenCalledWith(MOCK_PLAYER_DIFFERENCES.differencesPosition);
        expect(endGameVerifSpy).toHaveBeenCalled();
    });

    it('difference handler should send event when a difference detected and emitsound in multiplayer mode', () => {
        spyOn(component.left, 'emitSound').and.callFake((difference: boolean) => {
            return difference;
        });
        const sendSpy = spyOn(socketServiceMock, 'send').and.callThrough();
        component.differenceHandler(MOCK_INFORMATION);
        expect(sendSpy).toHaveBeenCalledWith(MATCH_EVENTS.Difference, {
            room: 'room',
            lastDifferences: [0, 1, 2, 3],
            differencesPosition: 2,
        });
        expect(sendSpy).toHaveBeenCalledWith(CHAT_EVENTS.Event, { room: 'room', isMultiplayer: true, event: 'Différence trouvée' });
        expect(component.left.emitSound).toHaveBeenCalledWith(false);
    });

    it('difference handler should call the effect handler and send a general event when difference detected', () => {
        component.isMultiplayer = false;
        Object.defineProperty(socketServiceMock, 'socketId', { value: 'mockSocket' });
        const sendSpy = spyOn(socketServiceMock, 'send').and.callThrough();
        spyOn(component.left, 'emitSound').and.callFake((difference: boolean) => {
            return difference;
        });
        spyOn(component, 'effectHandler');
        component.differenceHandler(MOCK_INFORMATION);
        expect(sendSpy).toHaveBeenCalledWith(CHAT_EVENTS.Event, { room: 'room', isMultiplayer: false, event: 'Différence trouvée' });
        expect(component.left.emitSound).toHaveBeenCalledWith(false);
        const information: PlayerDifference = { lastDifferences: [0, 1, 2, 3], differencesPosition: 2, socket: socketServiceMock.socketId };
        expect(component.effectHandler).toHaveBeenCalledWith(information);
    });

    it('endGameVerification should verify if currentScore of player is bigger than half \
    of the number of differences in multiplayer and send a win event if so', () => {
        component.numberOfDifferences = 4;
        component.currentScorePlayer = 2;
        const sendSpy = spyOn(socketServiceMock, 'send').and.callThrough();
        const notifyBestTimeSpy = spyOn(component, 'notifyNewBestTime').and.callThrough();
        component.endGameVerification();
        expect(sendSpy).toHaveBeenCalledWith(MATCH_EVENTS.Win, 'room');
        expect(notifyBestTimeSpy).toHaveBeenCalledWith(socketServiceMock.socketId, false, 'classique');
    });

    it('endGameVerification should call winGame if currentScore of player is equal to number of differences', () => {
        component.isMultiplayer = false;
        component.currentScorePlayer = 2;
        component.numberOfDifferences = 2;
        const sendSpy = spyOn(socketServiceMock, 'send');
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const notifyBestTimeSpy = spyOn(component, 'notifyNewBestTime').and.callFake(() => {});
        spyOn(component, 'winGame');
        component.endGameVerification();
        expect(component.winGame).toHaveBeenCalled();
        expect(sendSpy).not.toHaveBeenCalled();
        expect(notifyBestTimeSpy).toHaveBeenCalledWith(socketServiceMock.socketId, false, 'classique');
    });

    it('winGame should set all end game related boolean and open gameWin modal with true to multiplayer and winner name in multiplayer', () => {
        component.winGame('opponentId');
        expect(modalSpy.open).toHaveBeenCalledWith(GameWinModalComponent, { disableClose: true, data: { isMultiplayer: true, winner: 'opponent' } });
        expect(component.showNavBar).toBeFalse();
        expect(component.left.endGame).toBeTrue();
        expect(component.right.endGame).toBeTrue();
    });

    it('winGame should set all end game related boolean and open gameWin modal with false to multiplayer in solo', () => {
        component.isMultiplayer = false;
        component.winGame('playerId');
        expect(modalSpy.open).toHaveBeenCalledWith(GameWinModalComponent, { disableClose: true, data: { isMultiplayer: false, winner: 'player' } });
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
        const flashSpy = spyOn(component, 'handleFlash');

        const keyboardEvent = new KeyboardEvent('keydown', { key: 't' });

        foundDifferenceServiceSpy.foundDifferences = [];
        component.left.toggleCheatMode = false;
        component.right.toggleCheatMode = false;

        component.activateCheatMode(keyboardEvent);
        expect(flashSpy).toHaveBeenCalled();
    });

    it('activateCheatMode should be called with an array that contains all the differences', () => {
        const flashSpy = spyOn(component, 'handleFlash');
        const keyboardEvent = new KeyboardEvent('keydown', { key: 't' });

        foundDifferenceServiceSpy.foundDifferences = [];
        component.left.toggleCheatMode = false;
        component.right.toggleCheatMode = false;

        component.activateCheatMode(keyboardEvent);
        expect(flashSpy).toHaveBeenCalledWith([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('notifyNewBestTime should send gameHistory information as well as current timer time', () => {
        component.player = 'player';
        component.stageId = '0';
        component.opponent = 'loser';
        component.timerService.currentTime = 23;
        component.startTime = 'date';
        const sendSpy = spyOn(socketServiceMock, 'send');
        component.notifyNewBestTime('playerId', false, 'classique');
        expect(sendSpy).toHaveBeenCalledWith(CHAT_EVENTS.BestTime, MOCK_GAME_HISTORY);
    });

    it('notifyNewBestTime should send gameHistory information with correct names', () => {
        component.player = 'loser';
        component.stageId = '0';
        component.opponent = 'opponent';
        component.timerService.currentTime = 23;
        component.startTime = 'date';
        const sendSpy = spyOn(socketServiceMock, 'send');
        component.notifyNewBestTime('opponentId', false, 'classique');
        expect(sendSpy).toHaveBeenCalledWith(CHAT_EVENTS.BestTime, MOCK_GAME_HISTORY_2);
    });
});

const MOCK_INFORMATION: DifferenceInformation = {
    lastDifferences: [0, 1, 2, 3],
    differencesPosition: 2,
};

const MOCK_PLAYER_DIFFERENCES: PlayerDifference = {
    lastDifferences: [0, 1, 2, 3],
    differencesPosition: 2,
    socket: 'test',
};

const SERVICE_MOCK_GAME_CARD: GameCardInformation = {
    _id: '0',
    name: 'game',
    difficulty: 'Facile',
    differenceNumber: 7,
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

const MOCK_GAME_CONSTANTS: GameConstants = {
    countDown: 0,
    hint: 3,
    difference: 4,
};

const MOCK_GAME_HISTORY: GameHistoryDTO = {
    gameId: '0',
    gameName: 'game',
    gameMode: 'classique',
    gameDuration: 23,
    startTime: 'date',
    isMultiplayer: true,
    player1: {
        name: 'player',
        hasAbandon: false,
        hasWon: true,
    },
    player2: {
        name: 'loser',
        hasAbandon: false,
        hasWon: false,
    },
};

const MOCK_GAME_HISTORY_2: GameHistoryDTO = {
    gameId: '0',
    gameName: 'game',
    gameMode: 'classique',
    gameDuration: 23,
    startTime: 'date',
    isMultiplayer: true,
    player1: {
        name: 'opponent',
        hasAbandon: false,
        hasWon: true,
    },
    player2: {
        name: 'loser',
        hasAbandon: false,
        hasWon: false,
    },
};
