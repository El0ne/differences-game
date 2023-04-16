import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LimitedTimeModalComponent } from '@app/modals/limited-time-modal/limited-time-modal.component';

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
    dialogRef: MatDialogRef<unknown>;
    constructor(private dialog: MatDialog) {}
    openLimitedTimeModal() {
        const dialogRef = this.dialog.open(LimitedTimeModalComponent, { disableClose: true};

        this.dialogRef = dialogRef;
        dialogRef.afterClosed().subscribe((result) => {
            console.log(`Modal closed`);
        });
    }
}
