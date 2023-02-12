import { Component, OnDestroy, OnInit } from '@angular/core';
import { IdTransferService } from '@app/services/id-transfer/id-transfer.service';
import { SecondToMinuteService } from '@app/services/second-t o-minute/second-to-minute.service';
import { TimerSoloService } from '@app/services/timer-solo/timer-solo.service';
import { Subject } from 'rxjs';
import { MESSAGES_LENGTH } from './solo-view-constants';

@Component({
    selector: 'app-solo-view',
    templateUrl: './solo-view.component.html',
    styleUrls: ['./solo-view.component.scss'],
})
export class SoloViewComponent implements OnInit, OnDestroy {
    showErrorMessage: boolean = false;
    showTextBox: boolean = false;
    showWinMessage: boolean = false;
    showNavBar: boolean = true;
    messages: string[] = [];
    messageContent: string = '';
    differenceArray: number[][];
    currentScore: number = 0;
    numberOfDifferences: number;
    currentService: TimerSoloService;
    currentTime: number;
    currentGameId: string;
    endGame: Subject<void> = new Subject<void>();

    constructor(private timerService: TimerSoloService, private convertService: SecondToMinuteService, private idTransferService: IdTransferService) {
        this.numberOfDifferences = 1; // TODO: Ajouter lorsqu'on aura acces a GameCardInformation
        this.currentService = timerService;
    }

    emitEndGame() {
        this.endGame.next();
    }

    getIdFromGameCard(): void {
        this.currentGameId = this.idTransferService.getId();
    }

    ngOnInit(): void {
        this.showTime();
        this.getIdFromGameCard();
    }

    ngOnDestroy(): void {
        this.timerService.stopTimer();
    }

    showTime(): void {
        this.timerService.startTimer();
    }

    timesConvertion(time: number) {
        return this.convertService.convert(time);
    }

    finishGame() {
        this.emitEndGame();
        this.showWinMessage = true;
        this.showNavBar = false;
    }

    incrementScore() {
        this.currentScore += 1;
        if (this.numberOfDifferences === this.currentScore) {
            this.finishGame();
        }
    }

    toggleInfoCard() {
        this.showTextBox = !this.showTextBox;
    }

    toggleErrorMessage() {
        if (!this.showErrorMessage) {
            this.showErrorMessage = !this.showErrorMessage;
        }
    }

    untoggleErrorMessage() {
        if (this.showErrorMessage) {
            this.showErrorMessage = !this.showErrorMessage;
        }
    }

    sendMessage() {
        if (this.messageContent.length === MESSAGES_LENGTH.minLength || this.messageContent.length > MESSAGES_LENGTH.maxLength) {
            this.toggleErrorMessage();
        } else {
            if (this.showErrorMessage) {
                this.untoggleErrorMessage();
            }
            this.messages.push(this.messageContent);
        }
        this.messageContent = '';
    }
}
