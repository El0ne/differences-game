import { Injectable } from '@angular/core';
import { CanvasSelectionService } from '@app/services/canvas-selection/canvas-selection.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { CanvasInformations } from '@common/canvas-informations';

@Injectable({
    providedIn: 'root',
})
export class EraserService {
    canvasInformations: CanvasInformations;

    constructor(private canvasSelectionService: CanvasSelectionService, private undoRedoService: UndoRedoService) {}

    setColor(color: string): void {
        this.canvasInformations.selectedColor = color;
    }
    setProperties(information: CanvasInformations): void {
        this.canvasInformations = information;
    }

    startErase(mouseEvent: MouseEvent): void {
        this.canvasInformations.isUserClicking = true;
        const context = this.canvasInformations.drawingCanvas1.getContext('2d');

        const canvasRect = this.canvasInformations.drawingCanvas1.getBoundingClientRect();

        if (context)
            context.clearRect(
                mouseEvent.clientX - canvasRect.left - this.canvasInformations.eraserSize / 2,
                mouseEvent.clientY - canvasRect.top - this.canvasInformations.eraserSize / 2,
                this.canvasInformations.eraserSize,
                this.canvasInformations.eraserSize,
            );
    }

    stopErase(): void {
        this.canvasInformations.isUserClicking = false;
        this.undoRedoService.setProperties(this.canvasInformations);
        this.undoRedoService.pushCanvas(this.canvasInformations.drawingCanvas1);
    }

    erasing(mouseEvent: MouseEvent): void {
        this.canvasSelectionService.choseCanvas(mouseEvent);
        const context = this.canvasInformations.drawingCanvas1.getContext('2d');

        if (context && this.canvasInformations.isUserClicking) {
            const canvasRect = this.canvasInformations.drawingCanvas1.getBoundingClientRect();
            context.clearRect(
                mouseEvent.clientX - canvasRect.left - this.canvasInformations.eraserSize / 2,
                mouseEvent.clientY - canvasRect.top - this.canvasInformations.eraserSize / 2,
                this.canvasInformations.eraserSize,
                this.canvasInformations.eraserSize,
            );
        }
    }
}
