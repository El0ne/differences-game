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
    playerName: string = '';
    constructor(
        private dialogRef: MatDialogRef<ChosePlayerNameDialogComponent>,
        private socketService: SocketService,
        @Inject(MAT_DIALOG_DATA) public conditions: GameConditions,
    ) {}

    validateName(): void {
        const testName = this.playerName;
        if (testName.replace(/\s/g, '') !== '') {
            this.socketService.names.set(this.socketService.socketId, testName);
            this.dialogRef.close();
        } else {
            this.showNameErrorMessage = true;
        }
    }
}
