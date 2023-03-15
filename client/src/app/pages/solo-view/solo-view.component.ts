import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MAX_EFFECT_TIME } from '@app/components/click-event/click-event-constant';
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
import { DifferenceInformation, MultiplayerDifferenceInformation, PlayerDifference } from '@common/difference-information';
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
    isMultiplayer: boolean;
    showErrorMessage: boolean = false;
    showTextBox: boolean = false;
    showNavBar: boolean = true;
    player: string;
    opponent: string;
    messages: RoomMessage[] = [];
    messageContent: string = '';
    differenceArray: number[][];
    currentScorePlayer: number = 0;
    currentScoreOpponent: number = 0;
    numberOfDifferences: number;
    currentTime: number;
    currentGameId: string;
    endGame: Subject<void> = new Subject<void>();
    gameCardInfo: GameCardInformation;
    currentRoom: string;
    boundActivateCheatMode: (event: KeyboardEvent) => void = this.activateCheatMode.bind(this);

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
        const gameId = this.route.snapshot.paramMap.get('stageId');
        this.isMultiplayer = this.router.url.includes('multiplayer');
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
        this.addCheatMode();
        this.configureSocketReactions();
    }

    configureSocketReactions(): void {
        this.socketService.listen<Validation>(ChatEvents.WordValidated, (validation: Validation) => {
            if (validation.isValidated) {
                this.socketService.send<RoomManagement>(ChatEvents.RoomMessage, { room: this.currentRoom, message: validation.originalMessage });
            } else {
                this.messages.push({ socketId: this.socketService.socketId, message: validation.originalMessage, isEvent: true, isAbandon: false });
            }
        });
        this.socketService.listen<RoomMessage>(ChatEvents.RoomMessage, (data: RoomMessage) => {
            this.messages.push(data);
        });
        this.socketService.listen<RoomMessage>(ChatEvents.Abandon, (message: RoomMessage) => {
            this.winGame(this.player);
            this.messages.push(message);
        });
        this.socketService.listen<PlayerDifference>(ChatEvents.Difference, (data: PlayerDifference) => {
            this.effectHandler(data);
        });
        this.socketService.listen<string>(ChatEvents.Win, (socket: string) => {
            if (this.socketService.socketId === socket) {
                this.winGame(this.player);
            } else {
                this.winGame(this.opponent);
            }
        });
        this.socketService.listen<string>(ChatEvents.Disconnect, (socket: string) => {
            if (this.socketService.socketId === socket) {
                this.socketService.send(ChatEvents.Abandon, { name: this.player, room: this.currentRoom });
            } else this.socketService.send(ChatEvents.Abandon, { name: this.opponent, room: this.currentRoom });
        });
    }

    ngOnDestroy(): void {
        this.timerService.stopTimer();
        this.foundDifferenceService.clearDifferenceFound();
        this.socketService.disconnect();
        this.removeCheatMode();
    }

    invertDifferences(): void {
        this.left.toggleCheatMode = !this.left.toggleCheatMode;
        this.right.toggleCheatMode = !this.right.toggleCheatMode;
    }

    removeCheatMode(): void {
        document.removeEventListener('keydown', this.boundActivateCheatMode);
    }

    addCheatMode(): void {
        document.addEventListener('keydown', this.boundActivateCheatMode);
    }

    resetDifferences(event: KeyboardEvent): void {
        this.invertDifferences();
        setTimeout(() => {
            this.activateCheatMode(event);
        }, MAX_EFFECT_TIME);
    }

    activateCheatMode(event: KeyboardEvent): void {
        if (event.key === 't') {
            this.invertDifferences();
            this.left.clickEventService.getDifferences(this.currentGameId).subscribe((data) => {
                if (this.left.toggleCheatMode) this.handleFlash(this.foundDifferenceService.findPixelsFromDifference(data));
            });
        }
    }

    showTime(): void {
        this.timerService.startTimer();
    }

    timesConvertion(time: number): string {
        return this.convertService.convert(time);
    }

    winGame(winner: string): void {
        this.timerService.stopTimer();
        this.left.endGame = true;
        this.right.endGame = true;
        this.showNavBar = false;
        if (this.isMultiplayer) this.dialog.open(GameWinModalComponent, { disableClose: true, data: { isSolo: false, winner } });
        else this.dialog.open(GameWinModalComponent, { disableClose: true, data: { isSolo: true, winner } });
    }

    incrementScore(socket: string): void {
        if (this.socketService.socketId === socket) {
            this.currentScorePlayer += 1;
        } else {
            this.currentScoreOpponent += 1;
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
        this.socketService.send<string>(ChatEvents.Validate, this.messageContent);
        this.messageContent = '';
    }

    paintPixel(array: number[]): void {
        const rgbaValues = this.left.sendDifferencePixels(array);
        this.right.receiveDifferencePixels(rgbaValues, array);
    }

    handleMistake(): void {
        this.socketService.send<RoomEvent>(ChatEvents.Event, { room: this.currentRoom, isMultiplayer: this.isMultiplayer, event: 'Erreur' });
    }

    hint(): void {
        this.socketService.send<string>(ChatEvents.Hint, this.currentRoom);
    }
    handleFlash(currentDifferences: number[]): void {
        this.left.differenceEffect(currentDifferences);
        this.right.differenceEffect(currentDifferences);
    }
    differenceHandler(information: DifferenceInformation): void {
        if (this.isMultiplayer) {
            const multiplayerInformation: MultiplayerDifferenceInformation = {
                room: this.currentRoom,
                differencesPosition: information.differencesPosition,
                lastDifferences: information.lastDifferences,
            };
            this.socketService.send<DifferenceInformation>(ChatEvents.Difference, multiplayerInformation);
        } else {
            const difference: PlayerDifference = {
                differencesPosition: information.differencesPosition,
                lastDifferences: information.lastDifferences,
                socket: this.socketService.socketId,
            };
            this.effectHandler(difference);
        }
        this.left.emitSound(false);
        this.socketService.send<RoomEvent>(ChatEvents.Event, {
            room: this.currentRoom,
            isMultiplayer: this.isMultiplayer,
            event: 'Différence trouvée',
        });
    }

    effectHandler(information: PlayerDifference): void {
        if (!this.left.toggleCheatMode) {
            this.handleFlash(information.lastDifferences);
        }
        this.paintPixel(information.lastDifferences);
        this.incrementScore(information.socket);
        this.addDifferenceDetected(information.differencesPosition);
        this.endGameVerification();
    }

    endGameVerification(): void {
        if (this.isMultiplayer) {
            const endGameVerification = this.numberOfDifferences / 2;
            if (this.currentScorePlayer >= endGameVerification) {
                this.socketService.send<string>(ChatEvents.Win, this.currentRoom);
            }
        } else {
            if (this.currentScorePlayer === this.numberOfDifferences) {
                this.winGame(this.player);
            }
        }
    }
}
