import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChatSocketService } from '@app/services/socket/socket.service';
import { GameConditions, PlayersInformation } from '@common/chat-dialog-constants';

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
        public dialogRef: MatDialogRef<ChosePlayerNameDialogComponent>,
        private chat: ChatSocketService,
        @Inject(MAT_DIALOG_DATA) public conditions: GameConditions,
    ) {
        this.chat.connect();
        this.configureSocketReactions();
    }

    get socketId() {
        return this.chat.sio.id ? this.chat.sio.id : '';
    }

    configureSocketReactions() {
        this.chat.listen('PlayerWaiting', (data: PlayersInformation) => {
            this.awaitingPlayer = false;
            if (this.chat.names[0] === data.player) {
                this.chat.names[1] = data.adversary as string;
            } else {
                this.chat.names[1] = data.player;
            }
            this.chat.gameRoom = data.room;
            this.dialogRef.close();
        });
        this.chat.listen('WaitingRoom', () => {
            this.chat.send('joinRoom', this.socketId);
            this.awaitingPlayer = true;
        });
    }

    validateName(): void {
        const testName = this.playerName;
        if (testName.replace(/\s/g, '') !== '') {
            if (this.conditions.multiplayer) {
                this.chat.names[0] = this.playerName;
                this.chat.send('roomCheck', { game: this.conditions.game, name: this.playerName });
            } else {
                this.chat.names[0] = this.playerName;
                this.chat.send('joinRoom', this.socketId);
                this.chat.gameRoom = this.socketId;
                this.dialogRef.close();
            }
        } else {
            this.showNameErrorMessage = true;
        }
    }
}
