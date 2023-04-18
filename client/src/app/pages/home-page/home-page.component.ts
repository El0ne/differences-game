import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LimitedTimeComponent } from '@app/modals/limited-time/limited-time.component';
import { Routes } from '@app/modules/routes';

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
    constructor(private dialog: MatDialog) {}

    get routes(): typeof Routes {
        return Routes;
    }

    openLimitedTimeDialog(): void {
        this.dialog.open(LimitedTimeComponent);
    }
}
