import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
    constructor(private router: Router) {}
    // TODO : IMPLEMENT FUNCTIONS TO MATCH WANTED BEHAVIOUR
    showClassic() {
        this.router.navigate(['/test']); // TODO : REPLACE PLACEHOLDER BY ACTUAL PATH
    }
    showLimitedTime() {
        this.router.navigate(['/test']); // TODO : REPLACE PLACEHOLDER BY ACTUAL PATH
    }
    showConfig() {
        this.router.navigate(['/test']); // TODO : REPLACE PLACEHOLDER BY ACTUAL PATH
    }
}
