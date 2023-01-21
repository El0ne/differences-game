<<<<<<< HEAD
import { Component } from '@angular/core';
import { Router } from '@angular/router';
=======
import { Component, OnInit } from '@angular/core';
>>>>>>> parent of f037a05 (deleted all useless files)

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss'],
})
<<<<<<< HEAD
export class HomePageComponent {
    constructor(private router: Router) {}
    // TODO : IMPLEMENT FUNCTIONS TO MATCH WANTED BEHAVIOUR
    showClassic() {
        this.router.navigate(['/home']); // TODO : REPLACE PLACEHOLDER BY ACTUAL PATH
    }
    showLimitedTime() {
        this.router.navigate(['/home']); // TODO : REPLACE PLACEHOLDER BY ACTUAL PATH
    }
    showConfig() {
        this.router.navigate(['/home']); // TODO : REPLACE PLACEHOLDER BY ACTUAL PATH
=======
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
>>>>>>> parent of f037a05 (deleted all useless files)
    }
}
