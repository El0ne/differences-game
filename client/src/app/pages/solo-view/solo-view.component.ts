import { Component } from '@angular/core';
import { ClickEventsService } from '@app/services/click-events/click-events.service';
import { MOCK_ARRAY } from './mock-array';
import { MESSAGES_LENGTH, PATHS } from './solo-view-constants';

@Component({
    selector: 'app-solo-view',
    templateUrl: './solo-view.component.html',
    styleUrls: ['./solo-view.component.scss'],
})
export class SoloViewComponent {
    readonly paths = PATHS; // TODO : Verify with Nikolay if typing is fine for constants

    showErrorMessage: boolean = false;
    showTextBox: boolean = false;
    messages: string[] = [];
    messageContent: string = '';
    differenceArray: number[][];
    currentScore: number = 0;

    constructor(private service: ClickEventsService) {
        this.differenceArray = MOCK_ARRAY;
    }

    incrementScore() {
        this.currentScore += 1;
    }

    getCoord(e: MouseEvent) {
        this.service.isDifferent(e, this.differenceArray);
    }

    toggleInfoCard() {
        this.showTextBox = !this.showTextBox;
    }

    toggleErrorMessage() {
        if (!this.showErrorMessage) {
            this.showErrorMessage = !this.showErrorMessage;
        }
    }

    untoggleErrorMessage() {
        if (this.showErrorMessage) {
            this.showErrorMessage = !this.showErrorMessage;
        }
    }

    sendMessage() {
        if (this.messageContent.length === MESSAGES_LENGTH.minLength || this.messageContent.length > MESSAGES_LENGTH.maxLength) {
            this.toggleErrorMessage();
        } else {
            if (this.showErrorMessage) {
                this.untoggleErrorMessage();
            }
            this.messages.push(this.messageContent);
        }
        this.messageContent = '';
    }
}
