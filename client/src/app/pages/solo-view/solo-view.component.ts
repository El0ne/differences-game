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
import { SocketService } from '@app/services/socket/socket.service';
import { TimerSoloService } from '@app/services/timer-solo/timer-solo.service';
import { RoomMessage, Validation } from '@common/chat-gateway-constants';
import { ChatEvents, RoomEvent, RoomManagement } from '@common/chat.gateway.events';
import { differenceInformation, playerDifference } from '@common/difference-information';
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
    is1v1: boolean;
    showErrorMessage: boolean = false;
    showNameErrorMessage: boolean = false;
    showTextBox: boolean = false;
    showWinMessage: boolean = false;
    showNavBar: boolean = true;
    player: string;
    opponent: string;
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
        private foundDifferenceService: FoundDifferenceService,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private router: Router,
        public chat: SocketService,
    ) {}

    ngOnInit(): void {
        this.player = 'Player';
        this.opponent = 'Player 2';
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
            if (this.is1v1) {
                this.opponent = this.chat.names[1];
            } else this.opponent = '';
            this.currentRoom = this.chat.gameRoom;
            this.showTime();
            this.configureSocketReactions();
        });
    }

    configureSocketReactions(): void {
        this.chat.listen<Validation>(ChatEvents.WordValidated, (validation: Validation) => {
            if (validation.validated) {
                this.chat.send<RoomManagement>(ChatEvents.RoomMessage, { room: this.currentRoom, message: validation.originalMessage });
            } else {
                this.messages.push({ socketId: this.chat.socketId, message: validation.originalMessage, event: true });
            }
        });
        this.chat.listen<RoomMessage>(ChatEvents.RoomMessage, (data: RoomMessage) => {
            this.messages.push(data);
        });
        this.chat.listen<RoomMessage>(ChatEvents.Abandon, (message: RoomMessage) => {
            if (!(message.socketId === this.chat.socketId)) {
                this.winGame();
            }
            this.opponent = '';
            this.messages.push(message);
        });
        this.chat.listen<playerDifference>(ChatEvents.Difference, (data: playerDifference) => {
            this.effectHandler(data);
        });
        this.chat.listen<string>(ChatEvents.Win, (socket: string) => {
            if (this.chat.socketId === socket) {
                this.winGame();
            } else {
                this.loseGame();
            }
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

    winGame(): void {
        this.left.endGame = true;
        this.right.endGame = true;
        this.showWinMessage = true;
        this.showNavBar = false;
        this.dialog.open(GameWinModalComponent, { disableClose: true, data: true });
    }

    loseGame(): void {
        this.left.endGame = true;
        this.right.endGame = true;
        this.showWinMessage = true;
        this.showNavBar = false;
        this.dialog.open(GameWinModalComponent, { disableClose: true, data: false });
    }

    incrementScore(socket: string): void {
        if (this.chat.socketId === socket) {
            this.currentScorePlayer1 += 1;
        } else {
            this.currentScorePlayer2 += 1;
        }
    }

    addDifferenceDetected(differenceIndex: number): void {
        this.foundDifferenceService.addDifferenceFound(differenceIndex);
    }

    openInfoModal(): void {
        this.dialog.open(GameInfoModalComponent, {
            data: {
                gameCardInfo: this.gameCardInfo,
                numberOfDifferences: this.numberOfDifferences,
            },
        });
    }

    quitGame(): void {
        this.dialog.open(QuitGameModalComponent, { disableClose: true, data: { player: this.player, room: this.currentRoom } });
    }

    sendMessage(): void {
        this.chat.send<string>(ChatEvents.Validate, this.messageContent);
        this.messageContent = '';
    }

    paintPixel(array: number[]): void {
        const rgbaValues = this.left.sendDifferencePixels(array);
        this.right.receiveDifferencePixels(rgbaValues, array);
    }

    handleMistake(): void {
        this.chat.send<RoomEvent>(ChatEvents.Event, { room: this.currentRoom, multiplayer: this.is1v1, event: 'Erreur' });
    }

    hint(): void {
        this.chat.send<string>(ChatEvents.Hint, this.currentRoom);
    }
    handleFlash(currentDifferences: number[]): void {
        this.left.differenceEffect(currentDifferences);
        this.right.differenceEffect(currentDifferences);
    }
    differenceHandler(information: differenceInformation): void {
        if (this.is1v1) {
            information.room = this.currentRoom;
            this.chat.send<differenceInformation>(ChatEvents.Difference, information);
        } else {
            const difference: playerDifference = { differenceInformation: information, socket: this.chat.socketId };
            this.effectHandler(difference);
        }
        this.chat.send<RoomEvent>(ChatEvents.Event, { room: this.currentRoom, multiplayer: this.is1v1, event: 'Différence trouvée' });
    }

    effectHandler(information: playerDifference): void {
        this.handleFlash(information.differenceInformation.lastDifferences);
        this.paintPixel(information.differenceInformation.lastDifferences);
        this.incrementScore(information.socket);
        this.addDifferenceDetected(information.differenceInformation.differencesPosition);
        this.endGameVerification();
    }

    endGameVerification(): void {
        if (this.is1v1) {
            const endGameVerification = this.numberOfDifferences / 2;
            if (this.currentScorePlayer1 > endGameVerification) {
                this.chat.send<string>(ChatEvents.Win, this.currentRoom);
            }
        } else {
            if (this.currentScorePlayer1 === this.numberOfDifferences) {
                this.winGame();
            }
        }
    }
}
