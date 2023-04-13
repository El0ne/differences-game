/* eslint-disable no-underscore-dangle */
/* Required to allow for mongoDB unique _id to be reused in our database */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ChosePlayerNameDialogComponent } from '@app/modals/chose-player-name-dialog/chose-player-name-dialog.component';
import { WaitingRoomComponent, WaitingRoomDataPassing } from '@app/modals/waiting-room/waiting-room.component';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { GameParametersService } from '@app/services/game-parameters/game-parameters.service';
import { ImagesService } from '@app/services/images/images.service';
import { IMAGE } from '@app/services/server-routes';
import { SocketService } from '@app/services/socket/socket.service';
import { GameCardInformation } from '@common/game-card';
import { MATCH_EVENTS, SoloGameCreation } from '@common/match-gateway-communication';
import { JoinHostInWaitingRequest, WAITING_ROOM_EVENTS } from '@common/waiting-room-socket-communication';

@Component({
    selector: 'app-game-card-selection',
    templateUrl: './game-card-selection.component.html',
    styleUrls: ['./game-card-selection.component.scss'],
})
export class GameCardSelectionComponent implements OnInit {
    @Input() gameCardInformation: GameCardInformation;
    @Input() isConfig: boolean | null;
    @Output() refreshGameCard = new EventEmitter<void>();
    image: string = '';
    createGameButton: boolean = true;

    // we need more than 3 services/dialog/router
    // eslint-disable-next-line max-params
    constructor(
        private socketService: SocketService,
        private dialog: MatDialog,
        private router: Router,
        private gameCardService: GameCardInformationService,
        private gameParamService: GameParametersService,
        private imagesService: ImagesService,
    ) {}
    ngOnInit(): void {
        this.imagesService.getImageNames(this.gameCardInformation._id).subscribe((imageObject) => {
            this.image = `${IMAGE}/file/${imageObject.originalImageName}`;
        });
    }

    deleteGame(): void {
        this.socketService.send(WAITING_ROOM_EVENTS.DeleteGame, this.gameCardInformation._id);
    }

    resetBestTimes(): void {
        this.gameCardService.resetBestTime(this.gameCardInformation._id).subscribe(() => {
            this.refreshGameCard.emit();
        });
    }

    hostOrJoinGame(): void {
        if (this.createGameButton) {
            this.socketService.send<string>(WAITING_ROOM_EVENTS.HostGame, this.gameCardInformation._id);
        } else {
            this.socketService.send<JoinHostInWaitingRequest>(WAITING_ROOM_EVENTS.JoinHost, {
                stageId: this.gameCardInformation._id,
                playerName: this.socketService.names.get(this.socketService.socketId) as string,
            });
        }
        const data: WaitingRoomDataPassing = { stageId: this.gameCardInformation._id, isHost: this.createGameButton, isLimitedTimeMode: false };
        this.dialog.open(WaitingRoomComponent, { disableClose: true, data });
    }

    selectPlayerName(isMultiplayer: boolean): void {
        const dialogRef = this.dialog.open(ChosePlayerNameDialogComponent, { disableClose: true });
        dialogRef.afterClosed().subscribe((isNameEntered: boolean) => {
            if (isNameEntered) {
                this.gameParamService.gameParameters = {
                    stageId: this.gameCardInformation._id,
                    isLimitedTimeGame: false,
                    isMultiplayerGame: isMultiplayer,
                };
                if (!isMultiplayer) {
                    this.socketService.gameRoom = this.socketService.socketId;
                    this.socketService.send<SoloGameCreation>(MATCH_EVENTS.createSoloGame, {
                        stageId: this.gameCardInformation._id,
                        isLimitedTimeMode: false,
                    });
                    this.router.navigate(['/game']);
                } else this.hostOrJoinGame();
            }
        });
    }
}
