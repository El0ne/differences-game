import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { ClickEventComponent } from '@app/components/click-event/click-event.component';
import { ChosePlayerNameDialogComponent } from '@app/modals/chose-player-name-dialog/chose-player-name-dialog.component';
import { ClickEventService } from '@app/services/click-event/click-event.service';
import { GameCardInformation } from '@common/game-card';
import { of } from 'rxjs/internal/observable/of';
import { MESSAGES_LENGTH } from './solo-view-constants';
import { SoloViewComponent } from './solo-view.component';

describe('SoloViewComponent', () => {
    let component: SoloViewComponent;
    let fixture: ComponentFixture<SoloViewComponent>;
    let modalSpy: MatDialog;
    let afterClosedSpy: MatDialogRef<ChosePlayerNameDialogComponent>;

    beforeEach(async () => {
        modalSpy = jasmine.createSpyObj('MatDialog', ['open']);
        afterClosedSpy = jasmine.createSpyObj('MatDialogRef<ChosePlayerNameDialogComponent>', ['afterClosed']);
        afterClosedSpy.afterClosed = () => of('test');
        modalSpy.open = () => afterClosedSpy;

        await TestBed.configureTestingModule({
            declarations: [SoloViewComponent, ClickEventComponent, ChosePlayerNameDialogComponent],
            imports: [FormsModule, HttpClientTestingModule, RouterTestingModule, MatIconModule, MatDialogModule],
            providers: [{ provide: ClickEventService }, { provide: MatDialog, useValue: modalSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(SoloViewComponent);
        component = fixture.componentInstance;
        component.gameCardInfo = FAKE_GAME_CARD;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('showTextBox attribute should turn to true when toggleInfoCard is called and showTextBox is false', () => {
        component.showTextBox = false;
        component.toggleInfoCard();
        expect(component.showTextBox).toBeTrue();
    });

    it('showTextBox attribute should turn to false when toggleInfoCard is called and showTextBox is true', () => {
        component.showTextBox = true;
        component.toggleInfoCard();
        expect(component.showTextBox).toBeFalse();
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

    it('finishGame should set showNavBar to false and showWinScreen to true', () => {
        component.showNavBar = true;
        component.showWinMessage = false;
        component.finishGame();
        expect(component.showNavBar).toBeFalse();
        expect(component.showWinMessage).toBeTrue();
    });

    it('the playerName should be initialized after the modal is closed', () => {
        expect(component.playerName).toBe('test');
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

    it('paintPixel should call sendPixels and receivePixels properly', () => {
        const leftCanvasSpy = spyOn(component.left, 'sendDifferencePixels');
        const rightCanvasSpy = spyOn(component.right, 'receiveDifferencePixels');

        component.paintPixel([1]);

        expect(leftCanvasSpy).toHaveBeenCalled();
        expect(rightCanvasSpy).toHaveBeenCalled();
    });
});

const FAKE_GAME_CARD: GameCardInformation = {
    id: '0',
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
