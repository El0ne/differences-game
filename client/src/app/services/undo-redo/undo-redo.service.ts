import { Injectable } from '@angular/core';
import { CanvasInformations } from '@common/canvas-informations';
import { IMAGE_DIMENSIONS } from '@common/image-dimensions';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    canvasInformations: CanvasInformations;

    setProperties(information: CanvasInformations): void {
        this.canvasInformations = information;
    }

    pushCanvas(canvas: HTMLCanvasElement): void {
        this.canvasInformations.nbElements++;

        const canvasDataURL = canvas.toDataURL();
        if (this.canvasInformations.isInOriginalCanvas) {
            this.canvasInformations.actionsArray.push(true);
            this.canvasInformations.leftArrayPointer++;
            this.canvasInformations.leftCanvasArray.push(canvasDataURL);
        } else {
            this.canvasInformations.actionsArray.push(false);
            this.canvasInformations.rightArrayPointer++;
            this.canvasInformations.rightCanvasArray.push(canvasDataURL);
        }
    }

    undoAction(array: string[], pointer: number): void {
        const ctx = this.canvasInformations.actionsArray[this.canvasInformations.nbElements]
            ? this.canvasInformations.originalDrawnCanvas.getContext('2d')
            : this.canvasInformations.differenceDrawnCanvas.getContext('2d');

        const canvasPic = new Image();
        canvasPic.src = array[pointer];
        canvasPic.onload = () => {
            if (ctx) {
                ctx.clearRect(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
                ctx.drawImage(canvasPic, 0, 0);
            }
        };
    }

    undo(): void {
        if (this.canvasInformations.nbElements > 0) {
            this.canvasInformations.nbElements--;

            if (this.canvasInformations.actionsArray[this.canvasInformations.nbElements]) {
                this.canvasInformations.leftArrayPointer--;
                this.undoAction(this.canvasInformations.leftCanvasArray, this.canvasInformations.leftArrayPointer);
            } else {
                this.canvasInformations.rightArrayPointer--;
                this.undoAction(this.canvasInformations.rightCanvasArray, this.canvasInformations.rightArrayPointer);
            }
        }
    }

    redoAction(array: string[], pointer: number): void {
        const ctx = this.canvasInformations.actionsArray[this.canvasInformations.nbElements]
            ? this.canvasInformations.originalDrawnCanvas.getContext('2d')
            : this.canvasInformations.differenceDrawnCanvas.getContext('2d');

        const canvasPic = new Image();
        canvasPic.src = array[pointer];

        canvasPic.onload = () => {
            if (ctx) ctx.drawImage(canvasPic, 0, 0);
        };
        if (ctx) ctx.clearRect(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
    }

    redo(): void {
        if (this.canvasInformations.nbElements < this.canvasInformations.actionsArray.length) {
            if (this.canvasInformations.actionsArray[this.canvasInformations.nbElements]) {
                this.canvasInformations.leftArrayPointer++;
                this.redoAction(this.canvasInformations.leftCanvasArray, this.canvasInformations.leftArrayPointer);
            } else {
                this.canvasInformations.rightArrayPointer++;
                this.redoAction(this.canvasInformations.rightCanvasArray, this.canvasInformations.rightArrayPointer);
            }
            this.canvasInformations.nbElements++;
        }
    }
}
