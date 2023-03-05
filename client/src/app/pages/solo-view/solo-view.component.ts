import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ClickEventComponent } from '@app/components/click-event/click-event.component';
import { ChosePlayerNameDialogComponent } from '@app/modals/chose-player-name-dialog/chose-player-name-dialog.component';
import { GameInfoModalComponent } from '@app/modals/game-info-modal/game-info-modal.component';
import { GameWinModalComponent } from '@app/modals/game-win-modal/game-win-modal.component';
import { QuitGameModalComponent } from '@app/modals/quit-game-modal/quit-game-modal.component';
import { FoundDifferenceService } from '@app/services/found-differences/found-difference.service';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { SecondToMinuteService } from '@app/services/second-t o-minute/second-to-minute.service';
import { ChatSocketService } from '@app/services/socket/socket.service';
import { TimerSoloService } from '@app/services/timer-solo/timer-solo.service';
import { RoomMessage, Validation } from '@common/chat-gateway-constants';
import { differenceInformation } from '@common/difference-information';
import { GameCardInformation } from '@common/game-card';
import { Subject } from 'rxjs';

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
    player: string = 'Player';
    opponent: string = 'Player 2';
    messages: RoomMessage[] = [];
    messageContent: string = '';
    differenceArray: number[][];
    currentScorePlayer1: number = 0;
    currentScorePlayer2: number = 0;
    numberOfDifferences: number;
    currentTime: number;
    currentGameId: string;
    endGame: Subject<void> = new Subject<void>();
    gameCardInfo: GameCardInformation;
    currentRoom: string;

    // eslint-disable-next-line max-params
    constructor(
        public timerService: TimerSoloService,
        private convertService: SecondToMinuteService,
        private gameCardInfoService: GameCardInformationService,
        public foundDifferenceService: FoundDifferenceService,
        private route: ActivatedRoute,
        public dialog: MatDialog,
        public router: Router,
        private chat: ChatSocketService,
    ) {}

    get socketId() {
        return this.chat.sio.id ? this.chat.sio.id : '';
    }

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

        const dialogRef = this.dialog.open(ChosePlayerNameDialogComponent, { disableClose: true, data: { game: gameId, multiplayer: this.is1v1 } });
        dialogRef.afterClosed().subscribe(() => {
            this.player = this.chat.names[0];
            this.opponent = this.chat.names[1];
            this.currentRoom = this.chat.gameRoom;
            this.showTime();
            this.configureSocketReactions();
        });
    }

    configureSocketReactions() {
        this.chat.listen('wordValidated', (validation: Validation) => {
            if (validation.validated) {
                this.chat.send('roomMessage', { room: this.currentRoom, message: validation.originalMessage });
            } else {
                this.messages.push({ socketId: 'event', message: validation.originalMessage });
            }
        });
        this.chat.listen('roomMessage', (data: RoomMessage) => {
            this.messages.push(data);
        });
        this.chat.listen('event', (data: RoomMessage) => {
            if (this.is1v1) {
                if (data.socketId === this.socketId) {
                    data.message += this.player + '.';
                } else data.message += this.opponent + '.';
            }
            data.socketId = 'event';
            this.messages.push(data);
        });
        this.chat.listen('hint', (message: RoomMessage) => {
            this.messages.push(message);
        });
        this.chat.listen('abandon', (message: RoomMessage) => {
            if (!(message.socketId === this.socketId)) {
                this.finishGame();
            }
            message.socketId = 'event';
            this.messages.push(message);
        });
    }

    ngOnDestroy(): void {
        this.timerService.stopTimer();
        this.foundDifferenceService.clearDifferenceFound();
        this.chat.disconnect();
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

    // logic needed to be modified according to who adds a point
    incrementScore(): void {
        this.currentScorePlayer1 += 1;
        if (this.numberOfDifferences === this.currentScorePlayer1) {
            this.finishGame();
        }
    }

    addDifferenceDetected(differenceIndex: number): void {
        this.foundDifferenceService.addDifferenceFound(differenceIndex);
        this.chat.send('event', { room: this.currentRoom, multiplayer: this.is1v1, event: 'Différence trouvée' });
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
        this.dialog.open(QuitGameModalComponent, { disableClose: true, data: { player: this.player, room: this.currentRoom } });
    }

    sendMessage(): void {
        this.chat.send('validate', this.messageContent);
        this.messageContent = '';
    }

    paintPixel(array: number[]): void {
        const rgbaValues = this.left.sendDifferencePixels(array);
        this.right.receiveDifferencePixels(rgbaValues, array);
    }

    handleMistake(): void {
        this.chat.send('event', { room: this.currentRoom, multiplayer: this.is1v1, event: 'Erreur' });
    }

    hint(): void {
        this.chat.send('hint', this.currentRoom);
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
