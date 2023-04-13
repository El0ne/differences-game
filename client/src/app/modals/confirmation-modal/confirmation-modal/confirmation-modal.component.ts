import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-confirmation-modal',
    templateUrl: './confirmation-modal.component.html',
    styleUrls: ['./confirmation-modal.component.scss'],
})
export class ConfirmationModalComponent {
    constructor(private dialog: MatDialogRef<ConfirmationModalComponent>, @Inject(MAT_DIALOG_DATA) public data: { message: string }) {}

    cancel(): void {
        this.dialog.close(false);
    }

    confirm(): void {
        this.dialog.close(true);
    }
}
