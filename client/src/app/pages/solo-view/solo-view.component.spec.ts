/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MAX_EFFECT_TIME } from '@app/components/click-event/click-event-constant';
import { ClickEventComponent } from '@app/components/click-event/click-event.component';
import { ChosePlayerNameDialogComponent } from '@app/modals/chose-player-name-dialog/chose-player-name-dialog.component';
import { GameInfoModalComponent } from '@app/modals/game-info-modal/game-info-modal.component';
import { QuitGameModalComponent } from '@app/modals/quit-game-modal/quit-game-modal.component';
import { ClickEventService } from '@app/services/click-event/click-event.service';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { TimerSoloService } from '@app/services/timer-solo/timer-solo.service';
import { differenceInformation } from '@common/difference-information';
import { GameCardInformation } from '@common/game-card';
import { of } from 'rxjs';
import { MESSAGES_LENGTH } from './solo-view-constants';
import { SoloViewComponent } from './solo-view.component';

describe('SoloViewComponent', () => {
    let component: SoloViewComponent;
    let fixture: ComponentFixture<SoloViewComponent>;
    let modalSpy: MatDialog;
    let afterClosedSpy: MatDialogRef<ChosePlayerNameDialogComponent>;
    let timerServiceMock: TimerSoloService;
    let mockGameCardInfo: GameCardInformationService;

    beforeEach(async () => {
        timerServiceMock = jasmine.createSpyObj('TimerService', ['startTimer']);
        mockGameCardInfo = jasmine.createSpyObj('gameCardInformationService', ['getGameCardInfoFromId']);
        mockGameCardInfo.getGameCardInfoFromId = () => {
            return of(FAKE_GAME_CARD);
        };

        modalSpy = jasmine.createSpyObj('MatDialog', ['open']);
        afterClosedSpy = jasmine.createSpyObj('MatDialogRef<ChosePlayerNameDialogComponent>', ['afterClosed']);
        afterClosedSpy.afterClosed = () => of('test');
        modalSpy.open = () => afterClosedSpy;

        await TestBed.configureTestingModule({
            declarations: [SoloViewComponent, ClickEventComponent, ChosePlayerNameDialogComponent],
            imports: [FormsModule, HttpClientTestingModule, RouterTestingModule, MatIconModule, MatDialogModule],
            providers: [
                { provide: ClickEventService },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ stageId: '1' }) } } },
                { provide: GameCardInformationService, useValue: mockGameCardInfo },
                { provide: MatDialog, useValue: modalSpy },
                { provide: TimerSoloService, useValue: timerServiceMock },
            ],
            teardown: { destroyAfterEach: false },
        }).compileComponents();

        fixture = TestBed.createComponent(SoloViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('showErrorMessage attribute should be turned to true if toggleErrorMessage is called and showErrorMessage is false', () => {
        component.showErrorMessage = false;
        component.toggleErrorMessage();
        expect(component.showErrorMessage).toBeTrue();
    });

    it('showErrorMessage attribute should not be turned to false if toggleErrorMessage is called and showErrorMessage is true', () => {
        component.showErrorMessage = true;
        component.toggleErrorMessage();
        expect(component.showErrorMessage).toBeTrue();
    });

    it('showErrorMessage attribute should be turned to false if untoggleErrorMessage is called', () => {
        component.showErrorMessage = true;
        component.untoggleErrorMessage();
        expect(component.showTextBox).toBeFalse();
    });

    it('sendMessage should add message if message is fine', () => {
        component.messageContent = 'test message';
        component.sendMessage();
        expect(component.messages).toContain('test message');
    });

    it('sendMessage should call toggleErrorMessage if message is empty', () => {
        const toggleErrorMessageSpy = spyOn(component, 'toggleErrorMessage');

        component.messageContent = '';
        component.sendMessage();
        expect(toggleErrorMessageSpy).toHaveBeenCalled();
    });

    it('sendMessage should call toggleErrorMessage if message is too long', () => {
        const toggleErrorMessageSpy = spyOn(component, 'toggleErrorMessage');

        const longString = new Array(MESSAGES_LENGTH.maxLength + 2).join('a');

        component.messageContent = longString;
        component.sendMessage();
        expect(toggleErrorMessageSpy).toHaveBeenCalled();
    });

    it('sendMessage should call untoggleErrorMessage if errorMessage is too true', () => {
        const untoggleErrorMessageSpy = spyOn(component, 'untoggleErrorMessage');
        component.showErrorMessage = true;
        component.messageContent = 'test message';

        component.sendMessage();
        expect(untoggleErrorMessageSpy).toHaveBeenCalled();
    });

    it('should increment counter when increment counter is called', () => {
        component.currentScore = 0;
        component.incrementScore();
        const answer = 1;

        expect(component.currentScore).toEqual(answer);
    });

    it('finishGame should have been called if number of errors is equal to the current score in incrementScore', () => {
        const finishGameSpy = spyOn(component, 'finishGame');
        component.currentScore = 1;
        component.numberOfDifferences = 2;
        component.incrementScore();
        expect(finishGameSpy).toHaveBeenCalled();
    });

    it('the playerName should be initialized after the modal is closed', () => {
        expect(component.playerName).toBe('test');
    });

    it('showTime should call startTimer of service', () => {
        component.showTime();

        expect(timerServiceMock.startTimer).toHaveBeenCalled();
    });

    it('addDifferenceDetected should call addDifferenceFound of service', () => {
        const addDiffFoundSpy = spyOn(component.foundDifferenceService, 'addDifferenceFound');

        component.addDifferenceDetected(1);

        expect(addDiffFoundSpy).toHaveBeenCalled();
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
        expect(spy).toHaveBeenCalledWith(QuitGameModalComponent, { disableClose: true });
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
    it('ngOnInit() should set gameCard information if found in database', fakeAsync(() => {
        component.ngOnInit();
        expect(component.gameCardInfo).toEqual(FAKE_GAME_CARD);
        expect(component.numberOfDifferences).toEqual(FAKE_GAME_CARD.differenceNumber);
        discardPeriodicTasks();
    }));

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

    /*
    it('should call handleFlash when activateCheatMode is called', () => {
        const mockData = [[1, 2, 3], [4, 5], [6], [], [7, 8, 9]];
        spyOn(component.left.clickEventService, 'getDifferences').and.returnValue(of(mockData));
        const flashSpy = spyOn(component, 'handleFlash');

        const keyboardEvent = new KeyboardEvent('keydown', { key: 't' });

        component.foundDifferenceService.foundDifferences = [];
        component.left.toggleCheatMode = false;
        component.right.toggleCheatMode = false;

        component.activateCheatMode(keyboardEvent);
        expect(flashSpy).toHaveBeenCalled();
    });
*/

    it('finishGame should set endgame to true, and showNavBar to false', () => {
        component.left.endGame = false;
        component.right.endGame = false;
        component.showNavBar = true;

        component.finishGame();

        expect(component.left.endGame).toBeTrue();
        expect(component.right.endGame).toBeTrue();
        expect(component.showNavBar).toBeFalse();
    });
});

const MOCK_INFORMATION: differenceInformation = {
    lastDifferences: [0, 1, 2, 3],
    differencesPosition: 2,
};

const FAKE_GAME_CARD: GameCardInformation = {
    _id: '0',
    name: 'game.name',
    difficulty: 'Facile',
    differenceNumber: 6,
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
