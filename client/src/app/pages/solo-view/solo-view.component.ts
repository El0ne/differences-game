import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { ClickEventComponent } from '@app/components/click-event/click-event.component';
import { ChosePlayerNameDialogComponent } from '@app/modals/chose-player-name-dialog/chose-player-name-dialog.component';
import { GameInfoModalComponent } from '@app/modals/game-info-modal/game-info-modal.component';
import { GameWinModalComponent } from '@app/modals/game-win-modal/game-win-modal.component';
import { QuitGameModalComponent } from '@app/modals/quit-game-modal/quit-game-modal.component';
import { FoundDifferenceService } from '@app/services/found-differences/found-difference.service';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { SecondToMinuteService } from '@app/services/second-t o-minute/second-to-minute.service';
import { TimerSoloService } from '@app/services/timer-solo/timer-solo.service';
import { differenceInformation } from '@common/difference-information';
import { GameCardInformation } from '@common/game-card';
import { Subject, Subscription } from 'rxjs';
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
    differenceArray: number[][];
    currentScore: number = 0;
    numberOfDifferences: number;
    currentTime: number;
    currentGameId: string;
    endGame: Subject<void> = new Subject<void>();
    gameCardInfo: GameCardInformation;
    routerSubscription: Subscription;

    // eslint-disable-next-line max-params
    constructor(
        public timerService: TimerSoloService,
        private convertService: SecondToMinuteService,
        private gameCardInfoService: GameCardInformationService,
        public foundDifferenceService: FoundDifferenceService,
        private route: ActivatedRoute,
        public dialog: MatDialog,
        private router: Router,
    ) {}

    @HostListener('window:beforeunload')
    beforeUnloadHandler() {
        console.log('first');
        // TODO => fix to only endGamewhen game deleted (cuz we immediately recreate it after)
        // Causes problem otherwise cuz we could potentially delete the difference array when there are still people playing
        this.gameCardInfoService.endGame(this.currentGameId).subscribe();
    }

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
        });

        this.routerSubscription = this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                this.gameCardInfoService.endGame(this.currentGameId).subscribe();
            }
        });
    }

    ngOnDestroy(): void {
        this.timerService.stopTimer();
        this.foundDifferenceService.clearDifferenceFound();
        this.routerSubscription.unsubscribe();
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

        this.dialog.open(GameWinModalComponent, { disableClose: true });
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

    openInfoModal() {
        this.dialog.open(GameInfoModalComponent, {
            data: {
                gameCardInfo: this.gameCardInfo,
                numberOfDifferences: this.numberOfDifferences,
            },
        });
    }

    quitGame() {
        this.dialog.open(QuitGameModalComponent, { disableClose: true });
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
        this.handleFlash(information.lastDifferences);
        this.paintPixel(information.lastDifferences);
        this.incrementScore();
        this.addDifferenceDetected(information.differencesPosition);
    }
}
