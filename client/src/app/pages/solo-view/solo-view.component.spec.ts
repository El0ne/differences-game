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
import { GameLoseModalComponent } from '@app/modals/game-lose-modal/game-lose-modal.component';
import { GameWinModalComponent } from '@app/modals/game-win-modal/game-win-modal.component';
import { QuitGameModalComponent } from '@app/modals/quit-game-modal/quit-game-modal.component';
import { ClickEventService } from '@app/services/click-event/click-event.service';
import { FoundDifferenceService } from '@app/services/found-differences/found-difference.service';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { GameConstantsService } from '@app/services/game-constants/game-constants.service';
import { GameHintService } from '@app/services/game-hint/game-hint.service';
import { GameParametersService } from '@app/services/game-parameters/game-parameters.service';
import { ImagesService } from '@app/services/images/images.service';
import { SocketService } from '@app/services/socket/socket.service';
import { CHAT_EVENTS } from '@common/chat-gateway-events';
import { DifferenceInformation, PlayerDifference } from '@common/difference-information';
import { GameCardInformation } from '@common/game-card';
import { GameConstants } from '@common/game-constants';
import { GameHistoryDTO } from '@common/game-history.dto';
import { ImageObject } from '@common/image-object';
import { LIMITED_TIME_MODE_EVENTS, MATCH_EVENTS, ONE_SECOND, TWO_MINUTES } from '@common/match-gateway-communication';
import { of } from 'rxjs';
import { SoloViewComponent } from './solo-view.component';

describe('SoloViewComponent', () => {
    let component: SoloViewComponent;
    let fixture: ComponentFixture<SoloViewComponent>;
    let gameCardInfoService: GameCardInformationService;
    let imagesService: ImagesService;
    let socketServiceMock: SocketService;
    let foundDifferenceServiceSpy: FoundDifferenceService;
    let gameHintServiceMock: GameHintService;
    let modalSpy: MatDialog;
    let clickEventServiceSpy: ClickEventService;
    let gameConstantsService: GameConstantsService;
    let gameParamService: GameParametersService;

    const mockActivatedRoute = { snapshot: { paramMap: { get: () => '234' } } };
    let mockRouter: Router;

    beforeEach(async () => {
        clickEventServiceSpy = jasmine.createSpyObj<ClickEventService>('ClickEventService', ['getDifferences', 'isADifference', 'getDifferences']);
        clickEventServiceSpy.getDifferences = () => of([[1, 2, 3], [4, 5], [6], [], [7, 8, 9]]);

        gameHintServiceMock = jasmine.createSpyObj<GameHintService>('GameHintService', ['setColor', 'getPercentages']);
        gameHintServiceMock.getPercentages = () => {
            return [0.25, 0.25];
        };

        mockRouter = jasmine.createSpyObj<Router>('Router', ['navigate'], ['url']);
        Object.defineProperty(mockRouter, 'url', { value: 'game' });

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

        gameCardInfoService = jasmine.createSpyObj('GameCardInformationService', ['getGameCardInfoFromId']);
        gameCardInfoService.getGameCardInfoFromId = () => {
            return of(SERVICE_MOCK_GAME_CARD);
        };

        imagesService = jasmine.createSpyObj('ImagesService', ['getImageNames']);
        imagesService.getImageNames = () => {
            return of(SERVICE_MOCK_IMAGE_OBJECT);
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

        gameParamService = jasmine.createSpyObj('GameParametersService', ['gameParameters']);
        gameParamService.gameParameters = { isMultiplayerGame: true, isLimitedTimeGame: false, stageId: '234' };

        await TestBed.configureTestingModule({
            declarations: [SoloViewComponent, ClickEventComponent],
            imports: [FormsModule, HttpClientTestingModule, RouterTestingModule, MatIconModule, MatDialogModule, BrowserAnimationsModule],
            providers: [
                { provide: ClickEventService, useValue: clickEventServiceSpy },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: Router, useValue: mockRouter },
                { provide: GameCardInformationService, useValue: gameCardInfoService },
                { provide: ImagesService, useValue: imagesService },
                { provide: SocketService, useValue: socketServiceMock },
                { provide: FoundDifferenceService, useValue: foundDifferenceServiceSpy },
                { provide: MatDialog, useValue: modalSpy },
                { provide: GameParametersService, useValue: gameParamService },
                { provide: GameHintService, useValue: gameHintServiceMock },
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
        Object.defineProperty(gameParamService.gameParameters, 'isMultiplayerGame', { value: false });
        Object.defineProperty(mockRouter, 'url', { value: 'solo/234' });
        const sendSpy = spyOn(socketServiceMock, 'send').and.callThrough();
        component.ngOnInit();
        tick(ONE_SECOND);
        expect(sendSpy).toHaveBeenCalledTimes(1);
        expect(component.gameConstants).toEqual(MOCK_GAME_CONSTANTS);
    }));

    it('ngOnInit should listen to a new stage information if in limited time mode', fakeAsync(() => {
        Object.defineProperty(gameParamService.gameParameters, 'isLimitedTimeGame', { value: true });
        const sendSpy = spyOn(socketServiceMock, 'send').and.callThrough();
        socketServiceMock.listen = (event: string, callback: any) => {
            if (event === LIMITED_TIME_MODE_EVENTS.NewStageInformation) {
                callback(SERVICE_MOCK_IMAGE_OBJECT);
            }
        };
        component.ngOnInit();
        tick(ONE_SECOND);
        expect(sendSpy).toHaveBeenCalledTimes(1);
    }));

    it('ngOnInit should not call win game in case of end of game reached ', fakeAsync(() => {
        Object.defineProperty(gameParamService.gameParameters, 'isLimitedTimeGame', { value: true });
        const winGameSpy = spyOn(component, 'gameCompletion').and.callThrough();
        Object.defineProperty(modalSpy, 'openDialogs', { value: [] });
        socketServiceMock.listen = (event: string, callback: any) => {
            if (event === LIMITED_TIME_MODE_EVENTS.NewStageInformation) {
                callback(undefined);
            }
        };
        component.ngOnInit();
        tick(ONE_SECOND);
        expect(winGameSpy).toHaveBeenCalled();
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
                case MATCH_EVENTS.Lose: {
                    callback();
                }
                // No default
            }
        };
        Object.defineProperty(modalSpy, 'openDialogs', { value: [] });
        const listenSpy = spyOn(socketServiceMock, 'listen').and.callThrough();
        const sendSpy = spyOn(socketServiceMock, 'send').and.callThrough();
        const finishGameSpy = spyOn(component, 'gameCompletion');
        Object.defineProperty(socketServiceMock, 'socketId', { value: 'test' });
        component.configureSocketReactions();
        expect(listenSpy).toHaveBeenCalledTimes(6);
        expect(component.messages.length).toEqual(3);
        expect(sendSpy).toHaveBeenCalled();
        expect(finishGameSpy).toHaveBeenCalled();
        expect(finishGameSpy).toHaveBeenCalled();
    });

    it('Abandon scenario in limited time should not cause an end game event according to configureSocketReaction', () => {
        Object.defineProperty(gameParamService.gameParameters, 'isLimitedTimeGame', { value: true });
        socketServiceMock.listen = (event: string, callback: any) => {
            if (event === CHAT_EVENTS.Abandon) callback({ socketId: 'abandon', message: 'abandon' });
        };
        component.configureSocketReactions();
        expect(component.isMultiplayer).toBeFalse();
    });

    it('handleMistake should send an event called event to socket server with extra information', () => {
        const sendSpy = spyOn(socketServiceMock, 'send').and.callThrough();
        component.handleMistake();
        expect(sendSpy).toHaveBeenCalledWith('event', { isMultiplayer: true, event: 'Erreur' });
    });

    it('hint should send a hint event to socket server with the room information', () => {
        const sendSpy = spyOn(socketServiceMock, 'send').and.callThrough();
        component.hint();
        expect(sendSpy).toHaveBeenCalledWith('hint');
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

    it('should open the game info modal with the correct data', () => {
        spyOnProperty(component, 'isMultiplayer', 'get').and.returnValue(true);
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
        spyOnProperty(component, 'isMultiplayer', 'get').and.returnValue(false);
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
        const endGameVerifSpy = spyOn(component, 'endGameVerification');
        component.effectHandler(MOCK_PLAYER_DIFFERENCES);
        expect(handleFlashSpy).toHaveBeenCalledWith(MOCK_PLAYER_DIFFERENCES.lastDifferences);
        expect(paintPixelSpy).toHaveBeenCalledWith(MOCK_PLAYER_DIFFERENCES.lastDifferences);
        expect(incrementSpy).toHaveBeenCalledWith(MOCK_PLAYER_DIFFERENCES.socket);
        expect(foundDifferenceServiceSpy.addDifferenceFound).toHaveBeenCalledWith(MOCK_PLAYER_DIFFERENCES.differencesPosition);
        expect(endGameVerifSpy).toHaveBeenCalled();
    });

    it('difference handler should send event when a difference detected and emitsound in multiplayer mode', () => {
        spyOn(component.left, 'emitSound').and.callFake((difference: boolean) => {
            return difference;
        });
        const sendSpy = spyOn(socketServiceMock, 'send').and.callThrough();
        component.differenceHandler(MOCK_INFORMATION);
        expect(sendSpy).toHaveBeenCalledWith(MATCH_EVENTS.Difference, {
            lastDifferences: [0, 1, 2, 3],
            differencesPosition: 2,
        });
        expect(sendSpy).toHaveBeenCalledWith(CHAT_EVENTS.Event, { isMultiplayer: true, event: 'Différence trouvée' });
        expect(component.left.emitSound).toHaveBeenCalledWith(false);
    });

    it('difference handler should send event for a new difference when a difference detected and emitsound in limited mode', () => {
        spyOn(component.left, 'emitSound').and.callFake((difference: boolean) => {
            return difference;
        });
        Object.defineProperty(gameParamService.gameParameters, 'isLimitedTimeGame', { value: true });
        const sendSpy = spyOn(socketServiceMock, 'send').and.callThrough();
        component.differenceHandler(MOCK_INFORMATION);
        expect(sendSpy).toHaveBeenCalledWith(MATCH_EVENTS.Difference, {
            lastDifferences: [0, 1, 2, 3],
            differencesPosition: 2,
        });
        expect(sendSpy).toHaveBeenCalledWith(LIMITED_TIME_MODE_EVENTS.NextStage);
    });

    it('difference handler should call the effect handler and send a general event when difference detected', () => {
        spyOnProperty(component, 'isMultiplayer', 'get').and.returnValue(false);
        Object.defineProperty(socketServiceMock, 'socketId', { value: 'mockSocket' });
        const sendSpy = spyOn(socketServiceMock, 'send').and.callThrough();
        spyOn(component.left, 'emitSound').and.callFake((difference: boolean) => {
            return difference;
        });
        spyOn(component, 'effectHandler');
        component.differenceHandler(MOCK_INFORMATION);
        expect(sendSpy).toHaveBeenCalledWith(CHAT_EVENTS.Event, { isMultiplayer: false, event: 'Différence trouvée' });
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
        expect(sendSpy).toHaveBeenCalledWith(MATCH_EVENTS.Win);
        expect(notifyBestTimeSpy).toHaveBeenCalledWith(socketServiceMock.socketId, false, 'classique');
    });

    it('endGameVerification should call winGame if currentScore of player is equal to number of differences', () => {
        spyOnProperty(component, 'isMultiplayer', 'get').and.returnValue(false);
        component.currentScorePlayer = 2;
        component.numberOfDifferences = 2;
        const sendSpy = spyOn(socketServiceMock, 'send');
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const notifyBestTimeSpy = spyOn(component, 'notifyNewBestTime').and.callFake(() => {});
        spyOn(component, 'gameCompletion');
        Object.defineProperty(modalSpy, 'openDialogs', { value: [] });
        component.endGameVerification();
        expect(component.gameCompletion).toHaveBeenCalled();
        expect(sendSpy).not.toHaveBeenCalled();
        expect(notifyBestTimeSpy).toHaveBeenCalledWith(socketServiceMock.socketId, false, 'classique');
    });

    it('winGame should set all end game related boolean and open gameWin modal with true to multiplayer and winner name in multiplayer', () => {
        Object.defineProperty(modalSpy, 'openDialogs', { value: [] });
        component.gameCompletion(true, 'opponentId');
        expect(modalSpy.open).toHaveBeenCalledWith(GameWinModalComponent, { disableClose: true, data: { isMultiplayer: true, winner: 'opponent' } });
        expect(component.showNavBar).toBeFalse();
        expect(component.left.endGame).toBeTrue();
        expect(component.right.endGame).toBeTrue();
    });

    it('winGame should set all end game related boolean and open gameWin modal with false to multiplayer in solo', () => {
        spyOnProperty(component, 'isMultiplayer', 'get').and.returnValue(false);
        Object.defineProperty(modalSpy, 'openDialogs', { value: [] });
        component.gameCompletion(true, 'playerId');
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

    it('getDiffFromClick should call getRandomDifference', () => {
        const getRandomDifferenceSpy = spyOn(component, 'getRandomDifference');
        component.getDiffFromClick();
        expect(getRandomDifferenceSpy).toHaveBeenCalled();
    });

    it('setColor should call setColor from gameHintService', () => {
        component.setColor([]);
        expect(gameHintServiceMock.setColor).toHaveBeenCalled();
    });

    it('getRandomDifference should set hint positions and hintsRemaining on left component', () => {
        const mockDifference = [[1]];
        gameHintServiceMock.hintsRemaining = 2;
        Object.defineProperty(gameParamService.gameParameters, 'isLimitedTimeGame', { value: false });
        Object.defineProperty(gameParamService.gameParameters, 'isMultiplayerGame', { value: false });
        spyOn(component.left, 'getDifferences').and.returnValue(of(mockDifference));
        spyOn(foundDifferenceServiceSpy, 'findPixelsFromDifference').and.returnValue([4]);
        spyOn(gameHintServiceMock, 'getPercentages').and.returnValue([0.25, 0.25]);

        component.getRandomDifference({ key: 'i' } as KeyboardEvent);

        expect(component.right.currentPixelHint).toBe(component.left.currentPixelHint);
        expect(component.right.hintPosX).toBe(component.left.hintPosX);
        expect(component.right.hintPosY).toBe(component.left.hintPosY);
        expect(component.left.hintPosX).toBe(120);
        expect(component.left.hintPosY).toBe(160);
    });

    it('getRandomDifference should call activateThirdHint if the length of getPercentages is 0', () => {
        const mockDifference = [[1]];
        gameHintServiceMock.hintsRemaining = 1;
        Object.defineProperty(gameParamService.gameParameters, 'isLimitedTimeGame', { value: true });
        Object.defineProperty(gameParamService.gameParameters, 'isMultiplayerGame', { value: false });
        const thirdHintSpy = spyOn(component, 'activateThirdHint');
        spyOn(component.left, 'getDifferences').and.returnValue(of(mockDifference));
        spyOn(foundDifferenceServiceSpy, 'findPixelsFromDifference').and.returnValue([4]);
        spyOn(gameHintServiceMock, 'getPercentages').and.returnValue([]);

        component.getRandomDifference({ key: 'i' } as KeyboardEvent);

        expect(thirdHintSpy).toHaveBeenCalled();
    });

    it('activateThirdHint should set hintFlag to false and thirdHint to true', () => {
        component.activateThirdHint();
        expect(component.thirdHint).toBeTrue();
        expect(component.hintIcon).toBeFalse();
    });

    it('setCurrentHint should set hints properly', () => {
        gameHintServiceMock.hintsRemaining = 2;
        component.left.firstHint = false;
        component.left.secondHint = false;
        component.setCurrentHint();
        expect(component.left.firstHint).toBeTrue();
        expect(component.left.secondHint).toBeFalse();
    });

    it('setCurrentHint should set hints properly', () => {
        gameHintServiceMock.hintsRemaining = 1;
        component.left.firstHint = false;
        component.left.secondHint = false;
        component.setCurrentHint();
        expect(component.left.firstHint).toBeFalse();
        expect(component.left.secondHint).toBeTrue();
    });

    it('hintTimeouts should time out hints correctly', fakeAsync(() => {
        component.right.firstHint = true;
        component.right.secondHint = false;
        component.thirdHint = false;

        component.hintTimeouts();

        tick(4000);

        expect(component.left.firstHint).toBeFalse();
    }));

    it('hintTimeouts should time out hints correctly', fakeAsync(() => {
        component.right.firstHint = false;
        component.right.secondHint = true;
        component.thirdHint = false;

        component.hintTimeouts();

        tick(4000);

        expect(component.left.secondHint).toBeFalse();
    }));

    it('hintTimeouts should time out hints correctly', fakeAsync(() => {
        component.right.firstHint = false;
        component.right.secondHint = false;
        component.thirdHint = true;

        component.hintTimeouts();

        tick(8000);

        expect(component.thirdHint).toBeFalse();
    }));

    it('notifyNewBestTime should send gameHistory information as well as current timer time', () => {
        component.player = 'player';
        spyOnProperty(component, 'stageId', 'get').and.returnValue('0');
        component.opponent = 'loser';
        component.timerService.currentTime = 23;
        component.startTime = 'date';
        const sendSpy = spyOn(socketServiceMock, 'send');
        component.notifyNewBestTime('playerId', false, 'classique');
        expect(sendSpy).toHaveBeenCalledWith(CHAT_EVENTS.BestTime, MOCK_GAME_HISTORY);
    });

    it('notifyNewBestTime should send gameHistory information with correct names', () => {
        component.player = 'loser';
        spyOnProperty(component, 'stageId', 'get').and.returnValue('0');
        component.opponent = 'opponent';
        component.timerService.currentTime = 23;
        component.startTime = 'date';
        const sendSpy = spyOn(socketServiceMock, 'send');
        component.notifyNewBestTime('opponentId', false, 'classique');
        expect(sendSpy).toHaveBeenCalledWith(CHAT_EVENTS.BestTime, MOCK_GAME_HISTORY_2);
    });

    it('loseGame should open lose dialog component and set endGame conditions', () => {
        Object.defineProperty(modalSpy, 'openDialogs', { value: [] });
        component.gameCompletion(false);
        expect(modalSpy.open).toHaveBeenCalledWith(GameLoseModalComponent, { disableClose: true });
        expect(component.showNavBar).toBeFalse();
        expect(component.left.endGame).toBeTrue();
        expect(component.right.endGame).toBeTrue();
    });

    it('effect handler should update time in limited time mode', () => {
        Object.defineProperty(gameParamService.gameParameters, 'isLimitedTimeGame', { value: true });
        component.timerService.currentTime = 90;
        component.gameConstants.difference = 10;
        socketServiceMock.gameRoom = 'test';
        const sendSpy = spyOn(socketServiceMock, 'send').and.callThrough();
        component.effectHandler(MOCK_PLAYER_DIFFERENCES);
        expect(sendSpy).toHaveBeenCalledWith(LIMITED_TIME_MODE_EVENTS.Timer, 100);

        component.timerService.currentTime = 120;
        component.gameConstants.difference = 10;
        component.effectHandler(MOCK_PLAYER_DIFFERENCES);
        expect(sendSpy).toHaveBeenCalledWith(LIMITED_TIME_MODE_EVENTS.Timer, TWO_MINUTES);
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

const SERVICE_MOCK_IMAGE_OBJECT: ImageObject = {
    _id: '0',
    originalImageName: 'string',
    differenceImageName: 'string',
};
