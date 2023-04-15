import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ChosePlayerNameDialogComponent } from '@app/modals/chose-player-name-dialog/chose-player-name-dialog.component';
import { WaitingRoomComponent, WaitingRoomDataPassing } from '@app/modals/waiting-room/waiting-room.component';
import { GameParametersService } from '@app/services/game-parameters/game-parameters.service';
import { SocketService } from '@app/services/socket/socket.service';
import { LIMITED_TIME_MODE_EVENTS, MATCH_EVENTS, SoloGameCreation } from '@common/match-gateway-communication';
import { JoinHostInWaitingRequest, WAITING_ROOM_EVENTS } from '@common/waiting-room-socket-communication';

export const LIMITED_TIME_MODE_ID = 'limitedTimeMode';

@Component({
    selector: 'app-limited-time',
    templateUrl: './limited-time.component.html',
    styleUrls: ['./limited-time.component.scss'],
})
export class LimitedTimeComponent implements OnInit, OnDestroy {
    @ViewChild('modal') modal!: ElementRef;
    createGameButton: boolean = true;
    // reason: needed more than 4 parameters for the constructor
    // eslint-disable-next-line max-params
    constructor(
        private socketService: SocketService,
        private dialog: MatDialog,
        private router: Router,
        private gameParamService: GameParametersService,
    ) {}

    ngOnInit(): void {
        this.socketService.connect();
        this.socketService.listen(WAITING_ROOM_EVENTS.MatchCreated, () => {
            this.createGameButton = false;
        });

        this.socketService.listen(WAITING_ROOM_EVENTS.MatchDeleted, () => {
            this.createGameButton = true;
        });

        this.socketService.listen<string>(LIMITED_TIME_MODE_EVENTS.StartLimitedTimeGame, (stageId: string) => {
            this.gameParamService.gameParameters.stageId = stageId;
            this.router.navigate(['/game']);
        });

        this.socketService.send(WAITING_ROOM_EVENTS.ScanForHost, [LIMITED_TIME_MODE_ID]);
    }

    ngOnDestroy(): void {
        this.socketService.delete(WAITING_ROOM_EVENTS.MatchCreated);
        this.socketService.delete(WAITING_ROOM_EVENTS.MatchDeleted);
        this.socketService.delete(LIMITED_TIME_MODE_EVENTS.StartLimitedTimeGame);
    }

    hostOrJoinGame(): void {
        if (this.createGameButton) {
            this.socketService.send<string>(WAITING_ROOM_EVENTS.HostGame, LIMITED_TIME_MODE_ID);
        } else {
            this.socketService.send<JoinHostInWaitingRequest>(WAITING_ROOM_EVENTS.JoinHost, {
                stageId: LIMITED_TIME_MODE_ID,
                playerName: this.socketService.names.get(this.socketService.socketId) as string,
            });
        }
        const data: WaitingRoomDataPassing = { stageId: LIMITED_TIME_MODE_ID, isHost: this.createGameButton, isLimitedTimeMode: true };
        this.dialog.open(WaitingRoomComponent, { disableClose: true, data });
    }

    selectPlayerName(isMultiplayerGame: boolean): void {
        const dialogRef = this.dialog.open(ChosePlayerNameDialogComponent, { disableClose: true });
        dialogRef.afterClosed().subscribe((isNameEntered: boolean) => {
            if (isNameEntered) {
                this.gameParamService.gameParameters = {
                    isLimitedTimeGame: true,
                    isMultiplayerGame,
                    stageId: LIMITED_TIME_MODE_ID,
                };
                if (!isMultiplayerGame) {
                    this.socketService.gameRoom = this.socketService.socketId;
                    this.socketService.send<SoloGameCreation>(MATCH_EVENTS.createSoloGame, {
                        stageId: LIMITED_TIME_MODE_ID,
                        isLimitedTimeMode: true,
                    });
                } else this.hostOrJoinGame();
            }
        });
    }

    closeModal() {
        this.modal.nativeElement.remove();
    }
}
