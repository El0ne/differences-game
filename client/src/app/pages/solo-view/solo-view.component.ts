// we have to disable this rule because this file is too long
/* eslint-disable max-lines */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HEIGHT, MAX_EFFECT_TIME, WIDTH } from '@app/components/click-event/click-event-constant';
import { ClickEventComponent } from '@app/components/click-event/click-event.component';
import { GameInfoModalComponent } from '@app/modals/game-info-modal/game-info-modal.component';
import { GameLoseModalComponent } from '@app/modals/game-lose-modal/game-lose-modal.component';
import { GameWinModalComponent } from '@app/modals/game-win-modal/game-win-modal.component';
import { QuitGameModalComponent } from '@app/modals/quit-game-modal/quit-game-modal.component';
import { Routes } from '@app/modules/routes';
import { FoundDifferenceService } from '@app/services/found-differences/found-difference.service';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { GameConstantsService } from '@app/services/game-constants/game-constants.service';
import { GameHintService } from '@app/services/game-hint/game-hint.service';
import { GameParametersService } from '@app/services/game-parameters/game-parameters.service';
import { ImagesService } from '@app/services/images/images.service';
import { SocketService } from '@app/services/socket/socket.service';
import { TimerSoloService } from '@app/services/timer-solo/timer-solo.service';
import { EndGame } from '@common/chat-dialog-constants';
import { RoomMessage, Validation } from '@common/chat-gateway-constants';
import { CHAT_EVENTS, RoomEvent } from '@common/chat-gateway-events';
import { DifferenceInformation, PlayerDifference } from '@common/difference-information';
import { GameCardInformation } from '@common/game-card';
import { GameConstants } from '@common/game-constants';
import { GameHistoryDTO } from '@common/game-history.dto';
import { ImageObject } from '@common/image-object';
import { LIMITED_TIME_MODE_EVENTS, MATCH_EVENTS, TWO_MINUTES } from '@common/match-gateway-communication';
import { PlayerGameInfo } from '@common/player-game-info';
import { Subject } from 'rxjs';
import { DOUBLE_HINT_TIME_IN_MS, HINT_TIME_IN_MS } from './solo-view-constants';

@Component({
    selector: 'app-solo-view',
    templateUrl: './solo-view.component.html',
    styleUrls: ['./solo-view.component.scss'],
})
export class SoloViewComponent implements OnInit, OnDestroy {
    @ViewChild('left') left: ClickEventComponent;
    @ViewChild('right') right: ClickEventComponent;
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
    endGame: Subject<void> = new Subject<void>();
    gameCardInfo: GameCardInformation;
    imagesInfo: ImageObject;
    startTime: string;
    limitedMultiDto: GameHistoryDTO;
    limitedSoloDto: GameHistoryDTO;
    boundActivateCheatMode: (event: KeyboardEvent) => void = this.activateCheatMode.bind(this);
    gameConstants: GameConstants;
    // eslint-disable-next-line max-params -- need all parameters for constructor
    currentRoom: string;
    hintIcon: boolean;
    thirdHint: boolean;
    hintColor: string;
    boundGetRandomDifference: (event: KeyboardEvent) => void = this.getRandomDifference.bind(this);

    // we have more than 3 services
    // eslint-disable-next-line max-params
    constructor(
        public timerService: TimerSoloService,
        private gameCardInfoService: GameCardInformationService,
        private foundDifferenceService: FoundDifferenceService,
        private dialog: MatDialog,
        private router: Router,
        public socketService: SocketService,
        private gameConstantsService: GameConstantsService,
        private gameParamService: GameParametersService,
        private imagesService: ImagesService,
        private gameHintService: GameHintService,
    ) {}

    get stageId(): string {
        return this.gameParamService.gameParameters.stageId;
    }

    get isLimitedTimeMode(): boolean {
        return this.gameParamService.gameParameters.isLimitedTimeGame;
    }

    get isMultiplayer(): boolean {
        return this.gameParamService.gameParameters.isMultiplayerGame;
    }

    ngOnInit(): void {
        this.thirdHint = false;
        this.hintIcon = true;

        if (!this.socketService.liveSocket()) {
            this.router.navigate([`/${Routes.Home}`]);
            return;
        }
        this.player = this.socketService.names.get(this.socketService.socketId) as string;
        this.opponent = this.socketService.names.get(this.socketService.opponentSocket) as string;
        this.currentRoom = this.socketService.gameRoom;
        this.startTime = new Date().toLocaleString('fr-FR');
        this.gameConstantsService.getGameConstants().subscribe((gameConstants: GameConstants) => {
            this.gameConstants = gameConstants;
        });

        this.player = this.socketService.names.get(this.socketService.socketId) as string;
        this.opponent = this.socketService.names.get(this.socketService.opponentSocket) as string;
        this.startTime = new Date().toLocaleString('fr-FR');
        this.gameConstantsService.getGameConstants().subscribe((gameConstants: GameConstants) => {
            this.gameConstants = gameConstants;
            if (this.isLimitedTimeMode) {
                this.socketService.send<number>(LIMITED_TIME_MODE_EVENTS.Timer, this.gameConstants.countDown);
                this.timerService.limitedTimeTimer();
                if (this.isMultiplayer) this.createLimitedTimeGameHistory();
            }
        });
        this.getImagesNames();
        if (this.isLimitedTimeMode) {
            this.socketService.listen<void>(LIMITED_TIME_MODE_EVENTS.EndGame, () => {
                this.notifyEndGameLimitedTime();
            });
            this.socketService.listen<string>(LIMITED_TIME_MODE_EVENTS.NewStageInformation, (newStageId: string) => {
                this.gameParamService.gameParameters.stageId = newStageId;
                this.getImagesNames();
                if (!newStageId) {
                    this.gameCompletion(false);
                    this.timerService.stopTimer();
                }
            });
            if (!this.isMultiplayer) {
                this.limitedSoloDto = {
                    gameId: 'Limited',
                    gameName: 'Limited',
                    gameMode: 'Temps Limitée',
                    gameDuration: Date.now(),
                    startTime: this.startTime,
                    isMultiplayer: this.isMultiplayer,
                    player1: {
                        name: this.player,
                        hasAbandon: true,
                        hasWon: false,
                    },
                };
                this.socketService.send<GameHistoryDTO>(LIMITED_TIME_MODE_EVENTS.StoreLimitedGameInfo, this.limitedSoloDto);
            }
        } else {
            this.gameCardInfoService.getGameCardInfoFromId(this.stageId).subscribe((gameCardData) => {
                this.gameCardInfo = gameCardData;
                this.numberOfDifferences = this.gameCardInfo.differenceNumber;
                this.showTime();
                if (!this.isMultiplayer) {
                    const gameHistory: GameHistoryDTO = {
                        gameId: this.stageId,
                        gameName: this.gameCardInfo.name,
                        gameMode: 'Classique',
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
        this.addCheatMode();
        this.configureSocketReactions();
    }

    getImagesNames(): void {
        this.imagesService.getImageNames(this.stageId).subscribe((imageObject) => {
            this.imagesInfo = imageObject;
        });
    }

    configureSocketReactions(): void {
        this.socketService.listen<Validation>(CHAT_EVENTS.WordValidated, (validation: Validation) => {
            if (validation.isValidated) {
                this.socketService.send<string>(CHAT_EVENTS.RoomMessage, validation.originalMessage);
            } else {
                this.messages.push({ socketId: this.socketService.socketId, message: validation.originalMessage, event: 'notification' });
            }
        });
        this.socketService.listen<RoomMessage>(CHAT_EVENTS.RoomMessage, (data: RoomMessage) => {
            this.messages.push(data);
        });
        this.socketService.listen<RoomMessage>(CHAT_EVENTS.Abandon, (message: RoomMessage) => {
            if (!this.left.endGame) {
                message.message = `${message.message} - ${this.opponent} a abandonné la partie.`;
                this.messages.push(message);
                if (this.isLimitedTimeMode) {
                    this.gameParamService.gameParameters.isMultiplayerGame = false;
                    if (this.limitedMultiDto.player2) this.limitedMultiDto.player2.hasAbandon = true;
                    this.socketService.send<GameHistoryDTO>(LIMITED_TIME_MODE_EVENTS.StoreLimitedGameInfo, this.limitedMultiDto);
                } else {
                    this.gameCompletion(true, this.socketService.socketId);
                    this.notifyNewBestTime(this.socketService.socketId, true, 'classique');
                }
            }
        });
        this.socketService.listen<PlayerDifference>(MATCH_EVENTS.Difference, (data: PlayerDifference) => {
            this.effectHandler(data);
        });
        this.socketService.listen<string>(MATCH_EVENTS.Win, (socketId: string) => {
            this.gameCompletion(true, socketId);
        });
        this.socketService.listen<string>(MATCH_EVENTS.Lose, () => {
            this.gameCompletion(false);
        });
    }

    ngOnDestroy(): void {
        this.gameHintService.hintsRemaining = 3;
        this.timerService.currentTime = 0;
        this.foundDifferenceService.clearDifferenceFound();
        this.socketService.disconnect();
        this.removeCheatMode();
    }

    createLimitedTimeGameHistory(): void {
        this.limitedMultiDto = {
            gameId: 'limited',
            gameName: 'limited',
            gameMode: 'Temps limité',
            gameDuration: Date.now(),
            startTime: this.startTime,
            isMultiplayer: true,
            player1: {
                name: this.player,
                hasAbandon: false,
                hasWon: false,
            },
            player2: {
                name: this.opponent,
                hasAbandon: false,
                hasWon: false,
            },
        };
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
            this.left.getDifferences(this.stageId).subscribe((data) => {
                if (this.left.toggleCheatMode) this.handleFlash(this.foundDifferenceService.findPixelsFromDifference(data));
            });
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
            if (!this.isLimitedTimeMode) this.timerService.restartTimer(1, this.gameConstants.hint);
            else {
                const timeLeft = this.timerService.currentTime - this.gameConstants.hint;
                if (timeLeft > 0) {
                    this.socketService.send<number>(LIMITED_TIME_MODE_EVENTS.Timer, timeLeft);
                } else {
                    this.timerService.stopTimer();
                    this.socketService.send(MATCH_EVENTS.Lose);
                    return;
                }
            }
            if (this.hintsRemaining() > 0) this.socketService.send(CHAT_EVENTS.Hint, this.currentRoom);
            this.left.getDifferences(this.stageId).subscribe((data) => {
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

    notifyEndGameLimitedTime(): void {
        if (this.limitedSoloDto) {
            this.limitedSoloDto.player1.hasAbandon = false;
            this.socketService.send<GameHistoryDTO>(LIMITED_TIME_MODE_EVENTS.EndGame, this.limitedSoloDto);
        } else if (this.limitedMultiDto) this.socketService.send<GameHistoryDTO>(LIMITED_TIME_MODE_EVENTS.EndGame, this.limitedMultiDto);
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
            gameId: this.stageId,
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
        this.socketService.send<GameHistoryDTO>(CHAT_EVENTS.BestTime, gameHistory);
    }

    gameCompletion(classic: boolean, winnerId?: string): void {
        this.left.endGame = true;
        this.right.endGame = true;
        this.showNavBar = false;
        if (classic && !this.dialog.openDialogs.length && winnerId) {
            this.timerService.stopTimer();
            this.dialog.open(GameWinModalComponent, {
                disableClose: true,
                data: { isMultiplayer: this.isMultiplayer, winner: this.socketService.names.get(winnerId) } as EndGame,
            });
        } else if (!this.dialog.openDialogs.length) {
            this.dialog.open(GameLoseModalComponent, {
                disableClose: true,
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

    openInfoModal(): void {
        this.dialog.open(GameInfoModalComponent, {
            data: {
                gameCardInfo: this.gameCardInfo,
                numberOfDifferences: this.numberOfDifferences,
                numberOfPlayers: this.isMultiplayer ? 2 : 1,
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
        this.socketService.send<RoomEvent>(CHAT_EVENTS.Event, {
            isMultiplayer: this.isMultiplayer,
            event: 'Erreur',
        });
    }

    hint(): void {
        this.socketService.send<string>(CHAT_EVENTS.Hint);
    }

    handleFlash(currentDifferences: number[]): void {
        this.left.differenceEffect(currentDifferences);
        this.right.differenceEffect(currentDifferences);
    }

    addTimeToTimer(): void {
        this.socketService.send<number>(
            LIMITED_TIME_MODE_EVENTS.Timer,
            Math.min(this.timerService.currentTime + this.gameConstants.difference, TWO_MINUTES),
        );
    }

    differenceHandler(information: DifferenceInformation): void {
        if (this.isMultiplayer) {
            const multiplayerInformation: DifferenceInformation = {
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
            isMultiplayer: this.isMultiplayer,
            event: 'Différence trouvée',
        });

        if (this.isLimitedTimeMode) {
            this.socketService.send<void>(LIMITED_TIME_MODE_EVENTS.NextStage);
        }
    }
    effectHandler(information: PlayerDifference): void {
        if (!this.left.toggleCheatMode) {
            this.handleFlash(information.lastDifferences);
        }
        if (this.isLimitedTimeMode) {
            this.addTimeToTimer();
        }
        this.paintPixel(information.lastDifferences);
        this.incrementScore(information.socket);
        if (!this.isLimitedTimeMode) {
            this.foundDifferenceService.addDifferenceFound(information.differencesPosition);
            this.endGameVerification();
        }
    }
    endGameVerification(): void {
        if (this.isMultiplayer) {
            const endGameVerification = this.numberOfDifferences / 2;
            if (this.currentScorePlayer >= endGameVerification) {
                this.socketService.send(MATCH_EVENTS.Win);
                this.notifyNewBestTime(this.socketService.socketId, false, 'Classique');
            }
        } else {
            if (this.currentScorePlayer === this.numberOfDifferences) {
                this.gameCompletion(true, this.socketService.socketId);
                this.notifyNewBestTime(this.socketService.socketId, false, 'Classique');
            }
        }
    }
}
