import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ClickEventComponent } from '@app/components/click-event/click-event.component';
import { ChosePlayerNameDialogComponent } from '@app/modals/chose-player-name-dialog/chose-player-name-dialog.component';
import { FoundDifferenceService } from '@app/services/found-differences/found-difference.service';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { SecondToMinuteService } from '@app/services/second-t o-minute/second-to-minute.service';
import { TimerSoloService } from '@app/services/timer-solo/timer-solo.service';
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
    is1v1: boolean | null;
    showErrorMessage: boolean = false;
    showNameErrorMessage: boolean = false;
    showTextBox: boolean = false;
    showWinMessage: boolean = false;
    showNavBar: boolean = true;
    playerName: string = 'Player';
    playerName1: string = 'Player 1';
    playerName2: string = 'Player 2';
    messages: string[] = [];
    messageContent: string = '';
    differenceArray: number[][];
    currentScorePlayer1: number = 0;
    currentScorePlayer2: number = 0;
    numberOfDifferences: number;
    currentTime: number;
    currentGameId: string;
    endGame: Subject<void> = new Subject<void>();
    gameCardInfo: GameCardInformation;

    // eslint-disable-next-line max-params
    constructor(
        public timerService: TimerSoloService,
        private convertService: SecondToMinuteService,
        private gameCardInfoService: GameCardInformationService,
        public foundDifferenceService: FoundDifferenceService,
        private route: ActivatedRoute,
        public dialog: MatDialog,
        public router: Router,
    ) {}

    ngOnInit(): void {
        const gameId = this.route.snapshot.paramMap.get('stageId');
        this.is1v1 = this.router.url.includes('1v1');
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
        });
    }

    ngOnDestroy(): void {
        this.timerService.stopTimer();
        this.foundDifferenceService.clearDifferenceFound();
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

    // logic needed to be modified according to who adds a point
    incrementScore(): void {
        this.currentScorePlayer1 += 1;
        if (this.numberOfDifferences === this.currentScorePlayer1) {
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
}
