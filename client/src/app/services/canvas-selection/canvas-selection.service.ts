import { Injectable } from '@angular/core';
import { CanvasInformations } from '@common/canvas-informations';

@Injectable({
    providedIn: 'root',
})
export class CanvasSelectionService {
    canvasInformations: CanvasInformations;

    setProperties(information: CanvasInformations) {
        this.canvasInformations = information;
    }

    choseCanvas(mouseEvent: MouseEvent): CanvasInformations {
        const target = mouseEvent.target as HTMLCanvasElement;

        if ([this.canvasInformations.differenceRectangleCanvas, this.canvasInformations.differenceDrawnCanvas].includes(target)) {
            console.log('left');
            this.canvasInformations.isInOriginalCanvas = false;
            this.canvasInformations.drawingCanvas1 = this.canvasInformations.differenceDrawnCanvas;
            this.canvasInformations.drawingCanvas2 = this.canvasInformations.differenceRectangleCanvas;
        } else if ([this.canvasInformations.originalRectangleCanvas, this.canvasInformations.originalDrawnCanvas].includes(target)) {
            console.log('right');
            this.canvasInformations.isInOriginalCanvas = true;
            this.canvasInformations.drawingCanvas1 = this.canvasInformations.originalDrawnCanvas;
            this.canvasInformations.drawingCanvas2 = this.canvasInformations.originalRectangleCanvas;
        }

        return this.canvasInformations;
    }
}
