import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-solo-view',
    templateUrl: './solo-view.component.html',
    styleUrls: ['./solo-view.component.scss'],
})
export class SoloViewComponent implements OnInit {
    showTextBox: boolean = false;
    messages: string[] = [];
    messageContent: string = '';

    constructor() {}

    ngOnInit(): void {}

    toggleTextBox() {
        this.showTextBox = !this.showTextBox;
    }

    sendMessage() {
        const maxLength = 200;
        if (this.messageContent.length === 0 || this.messageContent.length > maxLength) {
            window.alert('message not of correct length');
        } else {
            this.messages.push(this.messageContent);
        }
        this.messageContent = '';
    }
}
