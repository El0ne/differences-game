/* eslint-disable max-lines */
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CloseInfoModalCommand } from '@app/commands/close-info-modal-command/close-info-modal-command';
import { Command, Invoker } from '@app/commands/command';
import { EndGameCommand } from '@app/commands/end-game-command/endgame-command';
import { KeyPressCommand } from '@app/commands/key-press/key-press-command';
import { OpenInfoModalCommand } from '@app/commands/open-info-modal-command/open-info-modal-command';
import { OpponentDifference } from '@app/commands/opponent-difference/opponent-difference';
import { SendMessageCommand } from '@app/commands/send-message/send-message-command';
import { WriteMessageCommand } from '@app/commands/write-message/write-message';
import { MAX_EFFECT_TIME } from '@app/components/click-event/click-event-constant';
import { ClickEventComponent } from '@app/components/click-event/click-event.component';
import { GameInfoModalComponent } from '@app/modals/game-info-modal/game-info-modal.component';
import { GameWinModalComponent } from '@app/modals/game-win-modal/game-win-modal.component';
import { QuitGameModalComponent } from '@app/modals/quit-game-modal/quit-game-modal.component';
import { ReplayGameModalComponent } from '@app/modals/replay-game-modal/replay-game-modal.component';
import { FoundDifferenceService } from '@app/services/found-differences/found-difference.service';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { GameConstantsService } from '@app/services/game-constants/game-constants.service';
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
    startTime: string;
    isClassic: boolean;
    boundActivateCheatMode: (event: KeyboardEvent) => void = this.activateCheatMode.bind(this);
    inputElement = document.querySelector('input');
    isWinner: boolean = false;

    isReplayMode: boolean = false;
    isReplayPaused: boolean = false;
    timeMultiplier: number = 1;
    replayTimeoutId: ReturnType<typeof setTimeout>;

    invoker: Invoker;
    commandIndex: number = 0;
    gameConstants: GameConstants;

    isCanvasEnabled: boolean = true;

    // eslint-disable-next-line max-params
    constructor(
        public timerService: TimerSoloService,
        private gameCardInfoService: GameCardInformationService,
        private foundDifferenceService: FoundDifferenceService,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private router: Router,
        public socketService: SocketService,
        private gameConstantsService: GameConstantsService,
    ) {
        this.invoker = new Invoker();
    }

    ngOnInit(): void {
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
            console.log('here');
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
            this.addCommand(new OpponentDifference(this, data));
            console.log('here');
            this.effectHandler(data);
        });
        this.socketService.listen<string>(MATCH_EVENTS.Win, (socketId: string) => {
            this.winGame(socketId);
        });
    }

    ngOnDestroy(): void {
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
            this.left.getDifferences(this.currentGameId).subscribe((data) => {
                if (this.left.toggleCheatMode) this.handleFlash(this.foundDifferenceService.findPixelsFromDifference(data));
            });

            if (this.isReplayMode === false) {
                const cheatModeCommand = new KeyPressCommand(event, this);
                this.addCommand(cheatModeCommand);
            }
        }
    }

    showTime(): void {
        this.timerService.startTimer();
    }

    timesConversion(): string {
        return this.timerService.convert(this.timerService.currentTime);
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
            if (this.isReplayMode === false) {
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
            },
        });

        if (this.isReplayMode === false) {
            this.addCommand(new OpenInfoModalCommand(this));
            dialogRef.afterClosed().subscribe(() => {
                this.addCommand(new CloseInfoModalCommand(this));
            });
        }
    }

    closeInfoModal(): void {
        this.dialog.closeAll();
    }

    quitGame(): void {
        const dialogRef = this.dialog.open(QuitGameModalComponent, {
            disableClose: true,
        });
        if (this.isReplayMode) {
            this.timerService.stopTimer();
            dialogRef.afterClosed().subscribe(() => {
                this.timerService.restartTimer(this.timeMultiplier);
            });
        }
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

    pauseReplay(): void {
        this.isReplayPaused = !this.isReplayPaused;
        if (this.isReplayPaused) {
            console.log('pause');
            this.timerService.stopTimer(this.socketService.socketId);
        } else {
            this.timerService.restartTimer(this.timeMultiplier, this.socketService.socketId);
        }
    }

    fastForwardReplay(multiplier: number): void {
        this.timeMultiplier = multiplier;
        this.timerService.restartTimer(this.timeMultiplier, this.socketService.socketId);
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
