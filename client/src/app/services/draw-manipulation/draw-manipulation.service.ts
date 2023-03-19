import { Injectable } from '@angular/core';
import { CanvasInformations } from '@common/canvas-informations';
import { IMAGE_DIMENSIONS } from '@common/image-dimensions';

@Injectable({
    providedIn: 'root',
})
export class DrawManipulationService {
    canvasInformations: CanvasInformations;

    setProperties(information: CanvasInformations) {
        this.canvasInformations = information;
    }

    invert() {
        const differenceDrawingContext = this.canvasInformations.differenceDrawnCanvas.getContext('2d');
        const originalDrawingContext = this.canvasInformations.originalDrawnCanvas.getContext('2d');
        const originalRectangleContext = this.canvasInformations.originalRectangleCanvas.getContext('2d');

        if (originalRectangleContext) originalRectangleContext.drawImage(this.canvasInformations.differenceDrawnCanvas, 0, 0);

        if (differenceDrawingContext) {
            differenceDrawingContext.clearRect(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
            differenceDrawingContext.drawImage(this.canvasInformations.originalDrawnCanvas, 0, 0);
        }

        if (originalDrawingContext) {
            originalDrawingContext.clearRect(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
            originalDrawingContext.drawImage(this.canvasInformations.originalRectangleCanvas, 0, 0);
        }

        if (originalRectangleContext) originalRectangleContext.clearRect(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
    }

    duplicate(side: string) {
        const differenceDrawingContext = this.canvasInformations.differenceDrawnCanvas.getContext('2d');
        const originalDrawingContext = this.canvasInformations.originalDrawnCanvas.getContext('2d');

        if (side === 'right' && differenceDrawingContext) {
            // console.log('right');
            differenceDrawingContext.drawImage(this.canvasInformations.originalDrawnCanvas, 0, 0);
        } else if (side === 'left' && originalDrawingContext) {
            // console.log('left');
            originalDrawingContext.drawImage(this.canvasInformations.differenceDrawnCanvas, 0, 0);
        }
    }
}
