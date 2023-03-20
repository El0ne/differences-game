import { Injectable } from '@angular/core';
import { CanvasSelectionService } from '@app/services/canvas-selection/canvas-selection.service';
import { CanvasInformations } from '@common/canvas-informations';

@Injectable({
    providedIn: 'root',
})
export class EraserButtonService {
    canvasInformations: CanvasInformations;

    constructor(private canvasSelectionService: CanvasSelectionService) {}

    setColor(color: string): void {
        this.canvasInformations.selectedColor = color;
    }
    setProperties(information: CanvasInformations) {
        this.canvasInformations = information;
    }

    startErase(mouseEvent: MouseEvent) {
        this.canvasInformations.isUserClicking = true;
        const ctx1 = this.canvasInformations.drawingCanvas1.getContext('2d');

        const canvasRect = this.canvasInformations.drawingCanvas1.getBoundingClientRect();

        if (ctx1)
            ctx1.clearRect(
                mouseEvent.clientX - canvasRect.left - this.canvasInformations.eraserSize / 2,
                mouseEvent.clientY - canvasRect.top - this.canvasInformations.eraserSize / 2,
                this.canvasInformations.eraserSize,
                this.canvasInformations.eraserSize,
            );
    }

    stopErase() {
        this.canvasInformations.isUserClicking = false;
        // this.pushCanvas(this.drawingCanvas1);
    }

    erasing(mouseEvent: MouseEvent) {
        this.canvasSelectionService.choseCanvas(mouseEvent);
        const ctx1 = this.canvasInformations.drawingCanvas1.getContext('2d');

        if (ctx1 && this.canvasInformations.isUserClicking) {
            const canvasRect = this.canvasInformations.drawingCanvas1.getBoundingClientRect();
            ctx1.clearRect(
                mouseEvent.clientX - canvasRect.left - this.canvasInformations.eraserSize / 2,
                mouseEvent.clientY - canvasRect.top - this.canvasInformations.eraserSize / 2,
                this.canvasInformations.eraserSize,
                this.canvasInformations.eraserSize,
            );
        }
    }
}
