import { Component, OnInit } from '@angular/core';
import { ClickEventsService } from '@app/services/click-events/click-events.service';
import { MESSAGES_LENGTH, PATHS } from './solo-view-constants';

@Component({
    selector: 'app-solo-view',
    templateUrl: './solo-view.component.html',
    styleUrls: ['./solo-view.component.scss'],
})
export class SoloViewComponent implements OnInit {
    readonly paths = PATHS; // TODO : Verify with Nikolay if typing is fine for constants

    showErrorMessage: boolean = false;
    showTextBox: boolean = false;
    messages: string[] = [];
    messageContent: string = '';

    constructor(private service: ClickEventsService) {}

    ngOnInit() {
        const image = new Image();
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

    getCoord(e: MouseEvent) {
        this.service.getCoordInImage(e);
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
