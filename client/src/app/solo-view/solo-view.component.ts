import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-solo-view',
    templateUrl: './solo-view.component.html',
    styleUrls: ['./solo-view.component.scss'],
})
export class SoloViewComponent implements OnInit {
    constructor() {}

    ngOnInit(): void {}

    test() {
        console.log('hey');
    }
}
