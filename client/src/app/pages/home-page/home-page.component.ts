import { Dialog } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { LimitedTimeComponent } from '@app/modals/limited-time/limited-time.component';

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
    constructor(private dialog: Dialog) {}

    openLimitedTimeDialog() {
        this.dialog.open(LimitedTimeComponent);
    }
}
