import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SocketService } from '@app/services/socket/socket.service';

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
        @Inject(MAT_DIALOG_DATA) private data: { isChosingGameTitle: boolean },
    ) {}

    get isChosingGameTitle(): boolean {
        // eslint-disable-next-line no-underscore-dangle -- private variable has the same name as the getter
        return this.data.isChosingGameTitle;
    }

    validateName(): void {
        const testName = this.playerName;
        if (testName.replace(/\s/g, '') !== '') {
            if (!this.isChosingGameTitle) {
                this.socketService.names.set(this.socketService.socketId, testName);
            }
            this.dialogRef.close(testName);
        } else {
            this.showNameErrorMessage = true;
        }
    }

    cancelNameInput(): void {
        this.dialogRef.close(false);
    }
}
