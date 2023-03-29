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
import { GameHintService } from '@app/services/game-hint/game-hint.service';
import { SocketService } from '@app/services/socket/socket.service';
import { TimerSoloService } from '@app/services/timer-solo/timer-solo.service';
import { EndGame } from '@common/chat-dialog-constants';
import { RoomMessage, Validation } from '@common/chat-gateway-constants';
import { CHAT_EVENTS, RoomEvent, RoomManagement } from '@common/chat-gateway-events';
import { DifferenceInformation, MultiplayerDifferenceInformation, PlayerDifference } from '@common/difference-information';
import { GameCardInformation } from '@common/game-card';
import { MATCH_EVENTS } from '@common/match-gateway-communication';
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
    currentScorePlayer: number = 0;
    currentScoreOpponent: number = 0;
    numberOfDifferences: number;
    currentGameId: string;
    endGame: Subject<void> = new Subject<void>();
    gameCardInfo: GameCardInformation;
    currentRoom: string;
    boundActivateCheatMode: (event: KeyboardEvent) => void = this.activateCheatMode.bind(this);
    boundGetRandomDifference: (event: KeyboardEvent) => void = this.getRandomDifference.bind(this);

    // eslint-disable-next-line max-params
    constructor(
        public timerService: TimerSoloService,
        private gameCardInfoService: GameCardInformationService,
        private foundDifferenceService: FoundDifferenceService,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private router: Router,
        public socketService: SocketService,
        private gameHintService: GameHintService,
    ) {}

    ngOnInit(): void {
        const gameId = this.route.snapshot.paramMap.get('stageId');
        this.isMultiplayer = this.router.url.includes('multiplayer');
        if (!this.socketService.liveSocket()) {
            this.router.navigate(['/home']);
            return;
        }

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
        this.socketService.listen<Validation>(CHAT_EVENTS.WordValidated, (validation: Validation) => {
            if (validation.isValidated) {
                this.socketService.send<RoomManagement>(CHAT_EVENTS.RoomMessage, { room: this.currentRoom, message: validation.originalMessage });
            } else {
                this.messages.push({ socketId: this.socketService.socketId, message: validation.originalMessage, event: 'notification' });
            }
        });
        this.socketService.listen<RoomMessage>(CHAT_EVENTS.RoomMessage, (data: RoomMessage) => {
            this.messages.push(data);
        });
        this.socketService.listen<RoomMessage>(CHAT_EVENTS.Abandon, (message: RoomMessage) => {
            this.winGame(this.socketService.socketId);
            message.message = `${message.message} - ${this.opponent} a abandonné la partie.`;
            this.messages.push(message);
        });
        this.socketService.listen<PlayerDifference>(MATCH_EVENTS.Difference, (data: PlayerDifference) => {
            this.effectHandler(data);
        });
        this.socketService.listen<string>(MATCH_EVENTS.Win, (socketId: string) => {
            this.winGame(socketId);
        });
    }

    ngOnDestroy(): void {
        this.gameHintService.hintsRemaining = 3;
        this.timerService.currentTime = 0;
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
        document.removeEventListener('keydown', this.boundGetRandomDifference);
    }

    addCheatMode(): void {
        document.addEventListener('keydown', this.boundActivateCheatMode);
        document.addEventListener('keydown', this.boundGetRandomDifference);
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
            this.left.getDifferences(this.currentGameId).subscribe((data) => {
                if (this.left.toggleCheatMode) this.handleFlash(this.foundDifferenceService.findPixelsFromDifference(data));
            });
        }
    }

    getDiffFromClick(): void {
        const keyEvent: KeyboardEvent = new KeyboardEvent('keydown', { key: 'i' });
        this.getRandomDifference(keyEvent);
    }

    getRandomDifference(event: KeyboardEvent | null): void {
        if (event?.key === 'i') {
            if (this.gameHintService.hintsRemaining > 0) this.socketService.send(CHAT_EVENTS.Hint, this.currentRoom);
            this.left.getDifferences(this.currentGameId).subscribe((data) => {
                const pixelArray = this.foundDifferenceService.findPixelsFromDifference(data);
                const randomPixel = pixelArray[Math.floor(Math.random() * pixelArray.length)];
                this.left.currentPixelHint = randomPixel;
                this.right.currentPixelHint = this.left.currentPixelHint;
                const randomPixelPosition = this.gameHintService.getPercentages(this.left.convertPosToPixel(randomPixel));
                this.left.hintPosX = (randomPixelPosition[1] * 480).toString();
                this.left.hintPosY = (randomPixelPosition[0] * 640).toString();
                this.right.hintPosX = this.left.hintPosX;
                this.right.hintPosY = this.left.hintPosY;
                this.left.firstHint = this.gameHintService.hintsRemaining === 2;
                this.left.secondHint = this.gameHintService.hintsRemaining === 1;
            });
        }
    }

    showTime(): void {
        this.timerService.startTimer();
    }

    timesConversion(): string {
        return this.timerService.convert(this.timerService.currentTime);
    }

    winGame(winnerId: string): void {
        if (!this.left.endGame) {
            this.timerService.stopTimer();
            this.left.endGame = true;
            this.right.endGame = true;
            this.showNavBar = false;
            this.dialog.open(GameWinModalComponent, {
                disableClose: true,
                data: { isMultiplayer: this.isMultiplayer, winner: this.socketService.names.get(winnerId) } as EndGame,
            });
        }
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
        this.dialog.open(QuitGameModalComponent, {
            disableClose: true,
        });
    }

    sendMessage(): void {
        this.socketService.send<string>(CHAT_EVENTS.Validate, this.messageContent);
        this.messageContent = '';
    }

    paintPixel(array: number[]): void {
        const rgbaValues = this.left.sendDifferencePixels(array);
        this.right.receiveDifferencePixels(rgbaValues, array);
    }

    handleMistake(): void {
        this.socketService.send<RoomEvent>(CHAT_EVENTS.Event, { room: this.currentRoom, isMultiplayer: this.isMultiplayer, event: 'Erreur' });
    }

    hint(): void {
        this.socketService.send<string>(CHAT_EVENTS.Hint, this.currentRoom);
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
            this.socketService.send<DifferenceInformation>(MATCH_EVENTS.Difference, multiplayerInformation);
        } else {
            const difference: PlayerDifference = {
                differencesPosition: information.differencesPosition,
                lastDifferences: information.lastDifferences,
                socket: this.socketService.socketId,
            };
            this.effectHandler(difference);
        }
        this.left.emitSound(false);
        this.socketService.send<RoomEvent>(CHAT_EVENTS.Event, {
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
                this.socketService.send<string>(MATCH_EVENTS.Win, this.currentRoom);
            }
        } else {
            if (this.currentScorePlayer === this.numberOfDifferences) {
                this.winGame(this.socketService.socketId);
            }
        }
    }
}
