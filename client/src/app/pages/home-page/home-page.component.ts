import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LimitedTimeComponent } from '@app/modals/limited-time/limited-time.component';

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
    constructor(private dialog: MatDialog) {}

    openLimitedTimeDialog(): void {
        this.dialog.open(LimitedTimeComponent);
    }
}
