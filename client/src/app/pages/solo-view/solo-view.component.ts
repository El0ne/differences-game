import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ClickEventComponent } from '@app/components/click-event/click-event.component';
import { ChosePlayerNameDialogComponent } from '@app/modals/chose-player-name-dialog/chose-player-name-dialog.component';
import { FoundDifferenceService } from '@app/services/found-differences/found-difference.service';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { SecondToMinuteService } from '@app/services/second-t o-minute/second-to-minute.service';
import { TimerSoloService } from '@app/services/timer-solo/timer-solo.service';
import { differenceInformation } from '@common/difference-information';
import { GameCardInformation } from '@common/game-card';
import { Subject } from 'rxjs';
import { MESSAGES_LENGTH } from './solo-view-constants';

@Component({
    selector: 'app-solo-view',
    templateUrl: './solo-view.component.html',
    styleUrls: ['./solo-view.component.scss'],
})
export class SoloViewComponent implements OnInit, OnDestroy {
    @ViewChild('left')
    left: ClickEventComponent;
    @ViewChild('right')
    right: ClickEventComponent;
    showErrorMessage: boolean = false;
    showNameErrorMessage: boolean = false;
    showTextBox: boolean = false;
    showWinMessage: boolean = false;
    showNavBar: boolean = true;
    playerName: string;
    messages: string[] = [];
    messageContent: string = '';
    currentScore: number = 0;
    numberOfDifferences: number;
    currentTime: number;
    currentGameId: string;
    endGame: Subject<void> = new Subject<void>();
    gameCardInfo: GameCardInformation;
    boundActivateCheatMode = this.activateCheatMode.bind(this);

    // eslint-disable-next-line max-params
    constructor(
        public timerService: TimerSoloService,
        private convertService: SecondToMinuteService,
        private gameCardInfoService: GameCardInformationService,
        public foundDifferenceService: FoundDifferenceService,
        private route: ActivatedRoute,
        public dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        const gameId = this.route.snapshot.paramMap.get('stageId');
        if (gameId) {
            this.currentGameId = gameId;
            this.gameCardInfoService.getGameCardInfoFromId(this.currentGameId).subscribe((gameCardData) => {
                this.gameCardInfo = gameCardData;
                this.numberOfDifferences = this.gameCardInfo.differenceNumber;
            });
        }

        const dialogRef = this.dialog.open(ChosePlayerNameDialogComponent, { disableClose: true });
        dialogRef.afterClosed().subscribe((result: string) => {
            this.playerName = result;
            this.showTime();
            document.addEventListener('keydown', this.boundActivateCheatMode);
        });
    }

    ngOnDestroy(): void {
        this.timerService.stopTimer();
        this.foundDifferenceService.clearDifferenceFound();
        document.removeEventListener('keydown', this.boundActivateCheatMode);
    }

    resetDifferences(event: KeyboardEvent) {
        this.left.toggleCheatMode = !this.left.toggleCheatMode;
        this.right.toggleCheatMode = !this.right.toggleCheatMode;
        setTimeout(() => {
            this.activateCheatMode(event);
        }, 400);
    }

    activateCheatMode(event: KeyboardEvent) {
        if (event.key === 't') {
            let differences: number[] = [];

            this.left.toggleCheatMode = !this.left.toggleCheatMode;
            this.right.toggleCheatMode = !this.right.toggleCheatMode;
            this.left.clickEventService.getDifferences(this.currentGameId).subscribe((data) => {
                for (const differenceNo of this.foundDifferenceService.foundDifferences) {
                    data[differenceNo] = [];
                }

                for (const difference of data) {
                    if (difference.length !== 0) {
                        differences = differences.concat(difference);
                    }
                }
                if (this.left.toggleCheatMode) this.handleFlash(differences);
            });
        }
    }

    deactivateCheatMode(event: KeyboardEvent) {
        if (event.key === 't') {
            this.left.toggleCheatMode = false;
            this.right.toggleCheatMode = false;
        }
    }

    showTime(): void {
        this.timerService.startTimer();
    }

    timesConvertion(time: number): string {
        return this.convertService.convert(time);
    }

    finishGame(): void {
        this.left.endGame = true;
        this.right.endGame = true;
        this.showWinMessage = true;
        this.showNavBar = false;
    }

    incrementScore(): void {
        this.currentScore += 1;
        if (this.numberOfDifferences === this.currentScore) {
            this.finishGame();
        }
    }

    addDifferenceDetected(differenceIndex: number): void {
        this.foundDifferenceService.addDifferenceFound(differenceIndex);
    }

    toggleInfoCard(): void {
        this.showTextBox = !this.showTextBox;
    }

    toggleErrorMessage(): void {
        if (!this.showErrorMessage) {
            this.showErrorMessage = !this.showErrorMessage;
        }
    }

    untoggleErrorMessage(): void {
        if (this.showErrorMessage) {
            this.showErrorMessage = !this.showErrorMessage;
        }
    }

    sendMessage(): void {
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

    paintPixel(array: number[]): void {
        const rgbaValues = this.left.sendDifferencePixels(array);
        this.right.receiveDifferencePixels(rgbaValues, array);
    }

    handleFlash(currentDifferences: number[]): void {
        this.left.differenceEffect(currentDifferences);
        this.right.differenceEffect(currentDifferences);
    }

    emitHandler(information: differenceInformation): void {
        if (!this.left.toggleCheatMode) {
            this.handleFlash(information.lastDifferences);
        }
        this.paintPixel(information.lastDifferences);
        this.incrementScore();
        this.addDifferenceDetected(information.differencesPosition);
    }
}
