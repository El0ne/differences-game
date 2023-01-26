import { Component } from '@angular/core';

@Component({
    selector: 'app-solo-view',
    templateUrl: './solo-view.component.html',
    styleUrls: ['./solo-view.component.scss'],
})
export class SoloViewComponent {
    showTextBox: boolean = false;
    messages: string[] = [];
    messageContent: string = '';

    toggleTextBox() {
        this.showTextBox = !this.showTextBox;
    }

    sendMessage() {
        const maxLength = 200;
        if (this.messageContent.length === 0 || this.messageContent.length > maxLength) {
            window.alert("Votre message n'est pas valide");
        } else {
            this.messages.push(this.messageContent);
        }
        this.messageContent = '';
    }
}
