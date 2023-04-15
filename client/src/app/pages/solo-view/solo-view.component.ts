/* eslint-disable max-lines */
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CloseModalCommand } from '@app/commands/close-modal/close-modal-command';
import { Command, Invoker } from '@app/commands/command';
import { EndGameCommand } from '@app/commands/end-game/end-game-command';
import { KeyPressCommand } from '@app/commands/key-press/key-press-command';
import { OpenModalCommand } from '@app/commands/open-modal-command/open-modal-command';
import { OpponentDifferenceCommand } from '@app/commands/opponent-difference/opponent-difference-command';
import { SendMessageCommand } from '@app/commands/send-message/send-message-command';
import { WriteMessageCommand } from '@app/commands/write-message/write-message';
import { HEIGHT, MAX_EFFECT_TIME, WIDTH } from '@app/components/click-event/click-event-constant';
import { ClickEventComponent } from '@app/components/click-event/click-event.component';
import { GameInfoModalComponent } from '@app/modals/game-info-modal/game-info-modal.component';
import { GameWinModalComponent } from '@app/modals/game-win-modal/game-win-modal.component';
import { QuitGameModalComponent } from '@app/modals/quit-game-modal/quit-game-modal.component';
import { ReplayGameModalComponent } from '@app/modals/replay-game-modal/replay-game-modal.component';
import { FoundDifferenceService } from '@app/services/found-differences/found-difference.service';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { GameConstantsService } from '@app/services/game-constants/game-constants.service';
import { GameHintService } from '@app/services/game-hint/game-hint.service';
import { ReplayButtonsService } from '@app/services/replay-buttons/replay-buttons.service';
import { SocketService } from '@app/services/socket/socket.service';
import { TimerSoloService } from '@app/services/timer-solo/timer-solo.service';
import { EndGame } from '@common/chat-dialog-constants';
import { RoomMessage, Validation } from '@common/chat-gateway-constants';
import { CHAT_EVENTS, RoomEvent, RoomManagement } from '@common/chat-gateway-events';
import { DifferenceInformation, MultiplayerDifferenceInformation, PlayerDifference } from '@common/difference-information';
import { GameCardInformation } from '@common/game-card';
import { GameConstants } from '@common/game-constants';
import { GameHistoryDTO } from '@common/game-history.dto';
import { MATCH_EVENTS } from '@common/match-gateway-communication';
import { PlayerGameInfo } from '@common/player-game-info';
import { Subject } from 'rxjs';
import { DOUBLE_HINT_TIME_IN_MS, HINT_TIME_IN_MS } from './solo-view-constants';

@Component({
    selector: 'app-solo-view',
    templateUrl: './solo-view.component.html',
    styleUrls: ['./solo-view.component.scss', './score-and-timer.scss'],
})
export class SoloViewComponent implements OnInit, OnDestroy {
    @ViewChild('left')
    left: ClickEventComponent;
    @ViewChild('right')
    right: ClickEventComponent;

    @ViewChild('inputField') inputChat: ElementRef<HTMLInputElement>;

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
    hintIcon: boolean;
    thirdHint: boolean;
    hintColor: string;
    startTime: string;
    isClassic: boolean;
    boundActivateCheatMode: (event: KeyboardEvent) => void = this.activateCheatMode.bind(this);
    inputElement = document.querySelector('input');
    isWinner: boolean = false;

    isReplayMode: boolean = false;
    isReplayPaused: boolean = false;
    replayTimeoutId: ReturnType<typeof setTimeout>;

    invoker: Invoker;
    commandIndex: number = 0;
    gameConstants: GameConstants;

    isCanvasEnabled: boolean = true;

    boundGetRandomDifference: (event: KeyboardEvent) => void = this.getRandomDifference.bind(this);

    // we have more than 3 services
    // eslint-disable-next-line max-params
    constructor(
        public timerService: TimerSoloService,
        private gameCardInfoService: GameCardInformationService,
        public foundDifferenceService: FoundDifferenceService,
        private route: ActivatedRoute,
        public dialog: MatDialog,
        private router: Router,
        public socketService: SocketService,
        private gameConstantsService: GameConstantsService,
        private gameHintService: GameHintService,
        private replayButtonsService: ReplayButtonsService,
    ) {}

    ngOnInit(): void {
        this.invoker = new Invoker();
        this.thirdHint = false;
        this.hintIcon = true;

        if (!this.socketService.liveSocket()) {
            this.router.navigate(['/home']);
            return;
        }
        this.player = this.socketService.names.get(this.socketService.socketId) as string;
        this.opponent = this.socketService.names.get(this.socketService.opponentSocket) as string;
        this.currentRoom = this.socketService.gameRoom;
        this.startTime = new Date().toLocaleString('fr-FR');
        const gameId = this.route.snapshot.paramMap.get('stageId');
        this.isMultiplayer = this.router.url.includes('multiplayer');
        this.isClassic = !this.router.url.includes('limited');
        this.gameConstantsService.getGameConstants().subscribe((gameConstants: GameConstants) => {
            this.gameConstants = gameConstants;
        });

        if (gameId) {
            this.currentGameId = gameId;
            this.gameCardInfoService.getGameCardInfoFromId(this.currentGameId).subscribe((gameCardData) => {
                this.gameCardInfo = gameCardData;
                this.numberOfDifferences = this.gameCardInfo.differenceNumber;
                if (!this.isMultiplayer) {
                    const gameHistory: GameHistoryDTO = {
                        gameId: this.currentGameId,
                        gameName: this.gameCardInfo.name,
                        gameMode: 'classique',
                        gameDuration: 0,
                        startTime: this.startTime,
                        isMultiplayer: this.isMultiplayer,
                        player1: {
                            name: this.player,
                            hasAbandon: true,
                            hasWon: false,
                        },
                    };
                    this.socketService.send<GameHistoryDTO>(MATCH_EVENTS.SoloGameInformation, gameHistory);
                }
            });
        }
        this.showTime();
        this.addCheatMode();
        this.configureSocketReactions();
    }

    getSocketId(): string {
        return this.socketService.socketId;
    }

    configureSocketReactions(): void {
        this.socketService.listen<Validation>(CHAT_EVENTS.WordValidated, (validation: Validation) => {
            if (validation.isValidated) {
                this.socketService.send<RoomManagement>(CHAT_EVENTS.RoomMessage, { room: this.currentRoom, message: validation.originalMessage });
            } else {
                this.messages.push({ socketId: this.socketService.socketId, message: validation.originalMessage, event: 'notification' });
                // this.addCommand(new SendMessageCommand(this, data));
            }
        });
        this.socketService.listen<RoomMessage>(CHAT_EVENTS.RoomMessage, (data: RoomMessage) => {
            this.messages.push(data);
            this.addCommand(new SendMessageCommand(this, data));
        });
        this.socketService.listen<RoomMessage>(CHAT_EVENTS.Abandon, (message: RoomMessage) => {
            if (!this.left.endGame) {
                this.winGame(this.socketService.socketId);
                this.notifyNewBestTime(this.socketService.socketId, true, 'classique');
                message.message = `${message.message} - ${this.opponent} a abandonné la partie.`;
                this.messages.push(message);
                this.addCommand(new SendMessageCommand(this, message));
            }
        });
        this.socketService.listen<PlayerDifference>(MATCH_EVENTS.Difference, (data: PlayerDifference) => {
            this.addCommand(new OpponentDifferenceCommand(this, data));
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

        if (!this.isReplayMode) {
            const cheatModeCommand = new KeyPressCommand(event, this);
            this.addCommand(cheatModeCommand);
        }
    }

    activateCheatMode(event: KeyboardEvent): void {
        if (event.key === 't') {
            this.invertDifferences();
            this.left.getDifferences(this.currentGameId).subscribe((data) => {
                if (this.left.toggleCheatMode) this.handleFlash(this.foundDifferenceService.findPixelsFromDifference(data));
            });

            if (!this.isReplayMode) {
                const cheatModeCommand = new KeyPressCommand(event, this);
                this.addCommand(cheatModeCommand);
            }
        }
    }

    getDiffFromClick(): void {
        const keyEvent: KeyboardEvent = new KeyboardEvent('keydown', { key: 'i' });
        this.getRandomDifference(keyEvent);
    }

    setColor(clickPosition: number[]): void {
        this.hintColor = this.gameHintService.setColor(clickPosition, this.left.convertPositionToPixel(this.left.currentPixelHint));
    }

    getRandomDifference(event: KeyboardEvent | null): void {
        if (event?.key === 'i' && !this.isMultiplayer && this.gameHintService.hintsRemaining > 0) {
            // TODO : Verifier que ca fonctionne avec temps limite
            if (this.isClassic) this.timerService.restartTimer(1, this.gameConstants.hint);
            else {
                this.timerService.restartTimer(1, -this.gameConstants.hint);
            }
            if (this.hintsRemaining() > 0) this.socketService.send(CHAT_EVENTS.Hint, this.currentRoom);
            this.left.getDifferences(this.currentGameId).subscribe((data) => {
                const pixelArray = this.foundDifferenceService.findPixelsFromDifference(data);
                const randomPixel = pixelArray[Math.floor(Math.random() * pixelArray.length)];
                this.left.currentPixelHint = randomPixel;
                this.right.currentPixelHint = this.left.currentPixelHint;
                const randomPixelPosition = this.gameHintService.getPercentages(this.left.convertPositionToPixel(randomPixel));
                if (randomPixelPosition.length === 0) {
                    this.activateThirdHint();
                } else {
                    this.left.hintPosX = randomPixelPosition[1] * HEIGHT;
                    this.left.hintPosY = randomPixelPosition[0] * WIDTH;
                    this.right.hintPosX = this.left.hintPosX;
                    this.right.hintPosY = this.left.hintPosY;
                }
                this.setCurrentHint();
                this.hintTimeouts();
            });
        }
    }

    setCurrentHint(): void {
        this.left.firstHint = this.gameHintService.hintsRemaining === 2;
        this.left.secondHint = this.gameHintService.hintsRemaining === 1;

        this.right.firstHint = this.gameHintService.hintsRemaining === 2;
        this.right.secondHint = this.gameHintService.hintsRemaining === 1;
    }

    hintTimeouts(): void {
        if (this.right.firstHint) {
            setTimeout(() => {
                this.left.firstHint = false;
                this.right.firstHint = false;
            }, HINT_TIME_IN_MS);
        } else if (this.right.secondHint) {
            setTimeout(() => {
                this.left.secondHint = false;
                this.right.secondHint = false;
            }, HINT_TIME_IN_MS);
        } else {
            setTimeout(() => {
                this.thirdHint = false;
            }, DOUBLE_HINT_TIME_IN_MS);
        }
    }

    activateThirdHint(): void {
        this.thirdHint = true;
        this.hintIcon = false;
    }

    showTime(): void {
        this.timerService.startTimer();
    }

    timesConversion(): string {
        return this.timerService.convert(this.timerService.currentTime);
    }

    hintsRemaining(): number {
        return this.gameHintService.hintsRemaining;
    }

    notifyNewBestTime(winnerId: string, isAbandon: boolean, mode: string): void {
        const winnerName: string = this.socketService.names.get(winnerId) as string;
        const player1: PlayerGameInfo = {
            name: winnerName,
            hasAbandon: false,
            hasWon: true,
        };

        const gameHistory: GameHistoryDTO = {
            gameId: this.currentGameId,
            gameName: this.gameCardInfo.name,
            gameMode: mode,
            gameDuration: this.timerService.currentTime,
            startTime: this.startTime,
            isMultiplayer: this.isMultiplayer,
            player1,
        };
        if (this.isMultiplayer) {
            const loserName = winnerName === this.player ? this.opponent : this.player;
            const player2: PlayerGameInfo = {
                name: loserName,
                hasAbandon: isAbandon,
                hasWon: false,
            };
            gameHistory.player2 = player2;
        }
        if (!this.isReplayMode) this.socketService.send<GameHistoryDTO>(CHAT_EVENTS.BestTime, gameHistory);
    }

    openReplayModal(): void {
        this.timerService.stopTimer(this.socketService.socketId);
        const dialogRef = this.dialog.open(ReplayGameModalComponent, {
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'replay') {
                this.resetPropertiesForReplay(this.socketService.socketId);
            } else if (result === 'continue') {
                clearTimeout(this.replayTimeoutId);
            }
        });
    }

    winGame(winnerId: string): void {
        let dialogRef;
        if (!this.left.endGame) {
            this.timerService.stopTimer();
            this.left.endGame = true;
            this.right.endGame = true;
            this.showNavBar = false;
            if (!this.isReplayMode) {
                dialogRef = this.dialog.open(GameWinModalComponent, {
                    disableClose: true,
                    data: { isMultiplayer: this.isMultiplayer, winner: this.socketService.names.get(winnerId), isWinner: this.isWinner } as EndGame,
                });
                dialogRef.afterClosed().subscribe(() => {
                    this.socketService.send<string>(MATCH_EVENTS.leaveRoom, this.socketService.gameRoom);
                    this.socketService.send<string>(MATCH_EVENTS.joinReplayRoom, this.socketService.socketId);
                    this.resetPropertiesForReplay(this.socketService.socketId);
                });
                if (this.isMultiplayer) {
                    const endGameCommand = new EndGameCommand(this);
                    this.addCommand(endGameCommand);
                }
            } else {
                this.openReplayModal();
            }
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
        const dialogRef = this.dialog.open(GameInfoModalComponent, {
            data: {
                gameCardInfo: this.gameCardInfo,
                numberOfDifferences: this.numberOfDifferences,
                numberOfPlayers: this.isMultiplayer ? 2 : 1,
                isReplayMode: this.isReplayMode,
            },
            disableClose: true,
        });

        if (!this.isReplayMode) {
            this.addCommand(new OpenModalCommand(this, true));
            dialogRef.afterClosed().subscribe(() => {
                this.addCommand(new CloseModalCommand(this));
            });
        }
    }

    closeModals(): void {
        this.dialog.closeAll();
    }

    quitGame(): void {
        const dialogRef = this.dialog.open(QuitGameModalComponent, {
            data: {
                isButtonDisabled: this.isReplayMode,
            },
            disableClose: true,
        });
        if (!this.isReplayMode) {
            this.addCommand(new OpenModalCommand(this, false));
            dialogRef.afterClosed().subscribe(() => {
                this.addCommand(new CloseModalCommand(this));
            });
        }
    }

    quitGameReplay(): void {
        const dialogRef = this.dialog.open(QuitGameModalComponent, {
            data: {
                isButtonDisabled: false,
            },
            disableClose: true,
        });
        this.timerService.stopTimer();
        dialogRef.afterClosed().subscribe(() => {
            this.timerService.restartTimer(this.replayButtonsService.timeMultiplier);
        });
    }

    inputIsChanging(): void {
        setTimeout(() => {
            const writeMessageCommand = new WriteMessageCommand(this.inputChat.nativeElement, this.messageContent);
            this.addCommand(writeMessageCommand);
        }, 50);
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
        if (!this.isReplayMode) {
            this.socketService.send<RoomEvent>(CHAT_EVENTS.Event, { room: this.currentRoom, isMultiplayer: this.isMultiplayer, event: 'Erreur' });
        }
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
        if (!this.isReplayMode) {
            this.socketService.send<RoomEvent>(CHAT_EVENTS.Event, {
                room: this.currentRoom,
                isMultiplayer: this.isMultiplayer,
                event: 'Différence trouvée',
            });
        }
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
                this.isWinner = true;
                this.socketService.send<string>(MATCH_EVENTS.Win, this.currentRoom);
                this.notifyNewBestTime(this.socketService.socketId, false, 'classique');
            }
        } else {
            if (this.currentScorePlayer === this.numberOfDifferences) {
                this.winGame(this.socketService.socketId);
                this.notifyNewBestTime(this.socketService.socketId, false, 'classique');
            }
        }
    }
    pauseReplay(): boolean {
        return this.replayButtonsService.pauseReplay(this.isReplayPaused);
    }

    fastForwardReplay(multiplier: number): void {
        this.replayButtonsService.fastForwardReplay(multiplier);
    }

    replayGame(): void {
        this.replayTimeoutId = setTimeout(() => {
            const command = this.invoker.commands[this.commandIndex];
            if (command.time === this.timerService.currentTime) {
                command.action.execute();
                this.commandIndex++;

                this.replayGame();
            } else {
                this.replayGame();
            }
        }, 50);
    }

    resetCanvas(): void {
        this.left.ngOnInit();
        this.right.ngOnInit();
    }

    resetPropertiesForReplay(room: string): void {
        this.resetCanvas();

        this.isReplayMode = true;
        this.isReplayPaused = false;
        this.timerService.currentTime = 0;
        this.messages = [];
        this.currentScorePlayer = 0;
        this.currentScoreOpponent = 0;
        this.timerService.restartTimer(1, room);
        this.commandIndex = 0;
        this.foundDifferenceService.clearDifferenceFound();
        this.showNavBar = true;
        this.left.endGame = false;
        this.right.endGame = false;
        this.replayGame();
    }

    addCommand(command: Command): void {
        if (!this.isReplayMode) this.invoker.addCommand(command, this.timerService.currentTime);
    }
}
