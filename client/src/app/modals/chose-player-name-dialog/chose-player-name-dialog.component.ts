import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SocketService } from '@app/services/socket/socket.service';

@Component({
    selector: 'app-chose-player-name-dialog',
    templateUrl: './chose-player-name-dialog.component.html',
    styleUrls: ['./chose-player-name-dialog.component.scss'],
})
export class ChosePlayerNameDialogComponent {
    showNameErrorMessage: boolean = false;
    playerName: string = '';
    constructor(public dialogRef: MatDialogRef<ChosePlayerNameDialogComponent>, public socket: SocketService) {}

    validateName(): void {
        const testName = this.playerName;
        if (testName.replace(/\s/g, '') !== '') {
            this.socket.names.set(this.socket.socketId, testName);
            this.dialogRef.close();
        } else {
            this.showNameErrorMessage = true;
        }
    }
}
