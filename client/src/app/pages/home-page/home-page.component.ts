import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
    constructor() {}

    ngOnInit(): void {}

    // TODO : IMPLEMENT FUNCTIONS TO MATCH WANTED BEHAVIOUR
    showClassic() {
        console.log('click working 1');
    }
    showLimitedTime() {
        console.log('click working 2');
    }
    showConfig() {
        console.log('click working 3');
    }
}
