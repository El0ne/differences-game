import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-solo-view',
    templateUrl: './solo-view.component.html',
    styleUrls: ['./solo-view.component.scss'],
})
export class SoloViewComponent implements OnInit {
    showTextBox: boolean = false;
    constructor() {}

    ngOnInit(): void {}

    toggleTextBox() {
        this.showTextBox = !this.showTextBox;
    }
}
