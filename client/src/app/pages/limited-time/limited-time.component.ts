import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ChosePlayerNameDialogComponent } from '@app/modals/chose-player-name-dialog/chose-player-name-dialog.component';
import { WaitingRoomComponent, WaitingRoomDataPassing } from '@app/modals/waiting-room/waiting-room.component';
import { SocketService } from '@app/services/socket/socket.service';
import { MATCH_EVENTS } from '@common/match-gateway-communication';
import { JoinHostInWaitingRequest, WAITING_ROOM_EVENTS } from '@common/waiting-room-socket-communication';

export const LIMITED_TIME_MODE_ID = 'limitedTimeMode';

@Component({
    selector: 'app-limited-time',
    templateUrl: './limited-time.component.html',
    styleUrls: ['./limited-time.component.scss'],
})
export class LimitedTimeComponent implements OnInit {
    createGameButton: boolean = true;
    constructor(private socketService: SocketService, private dialog: MatDialog, private router: Router) {}

    ngOnInit(): void {
        this.socketService.connect();
        this.socketService.listen(WAITING_ROOM_EVENTS.MatchCreated, () => {
            this.createGameButton = false;
        });

        this.socketService.listen(WAITING_ROOM_EVENTS.MatchDeleted, () => {
            this.createGameButton = true;
        });

        this.socketService.send(WAITING_ROOM_EVENTS.ScanForHost, [LIMITED_TIME_MODE_ID]);
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

    selectPlayerName(isSoloGame: boolean): void {
        const dialogRef = this.dialog.open(ChosePlayerNameDialogComponent, { disableClose: true });
        dialogRef.afterClosed().subscribe(() => {
            if (isSoloGame) {
                this.socketService.gameRoom = this.socketService.socketId;
                this.socketService.send(MATCH_EVENTS.createSoloGame, LIMITED_TIME_MODE_ID);
                this.router.navigate(['/solo/' + LIMITED_TIME_MODE_ID]);
            } else this.hostOrJoinGame();
        });
    }
}
