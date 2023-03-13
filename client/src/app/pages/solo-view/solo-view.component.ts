import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ClickEventComponent } from '@app/components/click-event/click-event.component';
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
        public socketService: SocketService,
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
        this.player = this.socketService.names.get(this.socketService.socketId) as string;
        this.opponent = this.socketService.names.get(this.socketService.opponentSocket) as string;
        this.currentRoom = this.socketService.gameRoom;
        this.showTime();
        this.configureSocketReactions();
    }

    configureSocketReactions(): void {
        this.socketService.listen<Validation>(ChatEvents.WordValidated, (validation: Validation) => {
            if (validation.isValidated) {
                this.socketService.send<RoomManagement>(ChatEvents.RoomMessage, { room: this.currentRoom, message: validation.originalMessage });
            } else {
                this.messages.push({ socketId: this.socketService.socketId, message: validation.originalMessage, isEvent: true });
            }
        });
        this.socketService.listen<RoomMessage>(ChatEvents.RoomMessage, (data: RoomMessage) => {
            this.messages.push(data);
        });
        this.socketService.listen<RoomMessage>(ChatEvents.Abandon, (message: RoomMessage) => {
            if (!(message.socketId === this.socketService.socketId)) {
                this.winGame(this.player);
            }
            this.opponent = '';
            this.messages.push(message);
        });
        this.socketService.listen<playerDifference>(ChatEvents.Difference, (data: playerDifference) => {
            this.effectHandler(data);
        });
        this.socketService.listen<string>(ChatEvents.Win, (socket: string) => {
            if (this.socketService.socketId === socket) {
                this.winGame(this.player);
            } else {
                this.winGame(this.opponent);
            }
        });
    }

    ngOnDestroy(): void {
        this.timerService.stopTimer();
        this.foundDifferenceService.clearDifferenceFound();
        this.socketService.disconnect();
    }

    showTime(): void {
        this.timerService.startTimer();
    }

    timesConvertion(time: number): string {
        return this.convertService.convert(time);
    }

    winGame(winner?: string): void {
        this.left.endGame = true;
        this.right.endGame = true;
        this.showNavBar = false;
        if (this.is1v1) this.dialog.open(GameWinModalComponent, { disableClose: true, data: { isSolo: false, winner } });
        else this.dialog.open(GameWinModalComponent, { disableClose: true, data: { isSolo: true } });
    }

    incrementScore(socket: string): void {
        if (this.socketService.socketId === socket) {
            this.currentScorePlayer1 += 1;
        } else {
            this.currentScorePlayer2 += 1;
        }
    }

    addDifferenceDetected(differenceIndex: number): void {
        this.foundDifferenceService.addDifferenceFound(differenceIndex);
        this.socketService.send<RoomEvent>(ChatEvents.Event, { room: this.currentRoom, isMultiplayer: this.is1v1, event: 'Différence trouvée' });
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
        this.socketService.send<string>(ChatEvents.Validate, this.messageContent);
        this.messageContent = '';
    }

    paintPixel(array: number[]): void {
        const rgbaValues = this.left.sendDifferencePixels(array);
        this.right.receiveDifferencePixels(rgbaValues, array);
    }

    handleMistake(): void {
        this.socketService.send<RoomEvent>(ChatEvents.Event, { room: this.currentRoom, isMultiplayer: this.is1v1, event: 'Erreur' });
    }

    hint(): void {
        this.socketService.send<string>(ChatEvents.Hint, this.currentRoom);
    }
    handleFlash(currentDifferences: number[]): void {
        this.left.differenceEffect(currentDifferences);
        this.right.differenceEffect(currentDifferences);
    }
    differenceHandler(information: differenceInformation): void {
        if (this.is1v1) {
            information.room = this.currentRoom;
            this.socketService.send<differenceInformation>(ChatEvents.Difference, information);
        } else {
            const difference: playerDifference = { differenceInformation: information, socket: this.socketService.socketId };
            this.effectHandler(difference);
        }
        this.left.emitSound(false);
        this.socketService.send<RoomEvent>(ChatEvents.Event, { room: this.currentRoom, isMultiplayer: this.is1v1, event: 'Différence trouvée' });
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
            if (this.currentScorePlayer1 >= endGameVerification) {
                this.socketService.send<string>(ChatEvents.Win, this.currentRoom);
            }
        } else {
            if (this.currentScorePlayer1 === this.numberOfDifferences) {
                this.winGame();
            }
        }
    }
}
