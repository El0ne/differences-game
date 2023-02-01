import { Component } from '@angular/core';
import { ClickEventsService } from '@app/services/click-events/click-events.service';
import { mockArray } from './mock-array';
import { MESSAGES_LENGTH, PATHS } from './solo-view-constants';

@Component({
    selector: 'app-solo-view',
    templateUrl: './solo-view.component.html',
    styleUrls: ['./solo-view.component.scss'],
})
export class SoloViewComponent {
    readonly paths = PATHS; // TODO : Verify with Nikolay if typing is fine for constants

    errorFromChildComponent: string;
    showErrorMessage: boolean = false;
    showTextBox: boolean = false;
    messages: string[] = [];
    messageContent: string = '';
    differenceArray: boolean[];

    constructor(private service: ClickEventsService) {
        this.differenceArray = mockArray;
    }
    /*
    ngOnInit() {
        const image = new Image(); // TODO : Double when there's a different image
        image.src = PATHS.temp;
        image.onload = () => {
            const diffCanvas = document.getElementById('differences') as HTMLCanvasElement;
            const ctx1 = diffCanvas.getContext('2d') as CanvasRenderingContext2D;
            ctx1.drawImage(image, 0, 0);

            const originalCanvas = document.getElementById('original') as HTMLCanvasElement;
            const ctx2 = originalCanvas.getContext('2d') as CanvasRenderingContext2D;
            ctx2.drawImage(image, 0, 0);
        };
    }
    */

    handler(differenceDetected: string) {
        this.errorFromChildComponent = differenceDetected;
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
