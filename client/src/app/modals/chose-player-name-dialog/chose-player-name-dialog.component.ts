import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SocketService } from '@app/services/socket/socket.service';
import { GameConditions } from '@common/chat-dialog-constants';

@Component({
    selector: 'app-chose-player-name-dialog',
    templateUrl: './chose-player-name-dialog.component.html',
    styleUrls: ['./chose-player-name-dialog.component.scss'],
})
export class ChosePlayerNameDialogComponent {
    showNameErrorMessage: boolean = false;
    awaitingPlayer: boolean = false;
    playerName: string = '';
    constructor(
        private dialogRef: MatDialogRef<ChosePlayerNameDialogComponent>,
        private socket: SocketService,
        @Inject(MAT_DIALOG_DATA) public conditions: GameConditions,
    ) {
        // this.socket.connect();
        // this.configureSocketReactions();
    }

    // configureSocketReactions(): void {
    //     this.chat.listen('PlayerWaiting', (data: PlayersInformation) => {
    //         this.awaitingPlayer = false;
    //         if (this.chat.names[0] === data.player) {
    //             this.chat.names[1] = data.adversary as string;
    //         } else {
    //             this.chat.names[1] = data.player;
    //         }
    //         this.chat.gameRoom = data.room;
    //         this.dialogRef.close();
    //     });
    //     this.chat.listen('WaitingRoom', () => {
    //         this.chat.send('joinRoom', this.chat.socketId);
    //         this.awaitingPlayer = true;
    //     });
    // }

    validateName(): void {
        const testName = this.playerName;
        if (testName.replace(/\s/g, '') !== '') {
            this.socket.names.set(this.socket.socketId, testName);
            this.dialogRef.close();
            // if (this.conditions.isMultiplayer) {
            //     this.chat.names[0] = this.playerName;
            //     this.chat.send('roomCheck', { game: this.conditions.game, name: this.playerName });
            // } else {
            //     this.chat.names[0] = this.playerName;
            //     this.chat.send('joinRoom', this.chat.socketId);
            //     this.chat.gameRoom = this.chat.socketId;
            //     this.dialogRef.close();
            // }
        } else {
            this.showNameErrorMessage = true;
        }
    }
}
