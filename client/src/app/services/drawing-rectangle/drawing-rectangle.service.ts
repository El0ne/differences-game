import { Injectable } from '@angular/core';
import { CanvasSelectionService } from '@app/services/canvas-selection/canvas-selection.service';
import { CanvasInformations } from '@common/canvas-informations';
import { UndoRedoService } from '../undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class DrawingRectangleService {
    canvasInformations: CanvasInformations;

    private rectangleListener: ((mouseEvent: MouseEvent) => void)[] = [
        this.startDrawingRectangle.bind(this),
        this.stopDrawingRectangle.bind(this),
        this.paintRectangle.bind(this),
    ];

    constructor(private canvasSelection: CanvasSelectionService, private undoRedoService: UndoRedoService) {}

    setColor(color: string): void {
        this.canvasInformations.selectedColor = color;
    }
    setProperties(information: CanvasInformations) {
        this.canvasInformations = information;
    }

    startDrawingRectangle(mouseEvent: MouseEvent): void {
        const canvas = this.canvasInformations.drawingCanvas2.getBoundingClientRect();
        this.canvasInformations.isUserClicking = true;

        this.canvasInformations.rectangleInitialX = mouseEvent.clientX - canvas.left;
        this.canvasInformations.rectangleInitialY = mouseEvent.clientY - canvas.top;
    }

    stopDrawingRectangle(): void {
        const firstContext = this.canvasInformations.drawingCanvas1.getContext('2d');
        const secondContext = this.canvasInformations.drawingCanvas2.getContext('2d');
        this.canvasInformations.isUserClicking = false;

        if (firstContext) firstContext.drawImage(this.canvasInformations.drawingCanvas2, 0, 0);
        if (secondContext) secondContext.clearRect(0, 0, this.canvasInformations.drawingCanvas2.width, this.canvasInformations.drawingCanvas2.height);

        // TODO Uncomment later when undo and redo are implemented
        console.log(this.canvasInformations.nbElements);

        this.undoRedoService.setProperties(this.canvasInformations);
        this.undoRedoService.pushCanvas(this.canvasInformations.drawingCanvas1);
    }

    paintRectangle(mouseEvent: MouseEvent): void {
        this.canvasSelection.choseCanvas(mouseEvent);
        const context = this.canvasInformations.drawingCanvas2.getContext('2d');

        if (context && this.canvasInformations.isUserClicking) {
            const canvas = this.canvasInformations.drawingCanvas2.getBoundingClientRect();
            context.fillStyle = this.canvasInformations.selectedColor;
            context.clearRect(0, 0, this.canvasInformations.drawingCanvas2.width, this.canvasInformations.drawingCanvas2.height);

            const width = mouseEvent.clientX - canvas.left - this.canvasInformations.rectangleInitialX;
            const height = mouseEvent.clientY - canvas.top - this.canvasInformations.rectangleInitialY;

            if (mouseEvent.shiftKey) {
                const size = Math.min(Math.abs(width), Math.abs(height));
                const signX = Math.sign(width);
                const signY = Math.sign(height);
                context.fillRect(this.canvasInformations.rectangleInitialX, this.canvasInformations.rectangleInitialY, size * signX, size * signY);
            } else {
                context.fillRect(this.canvasInformations.rectangleInitialX, this.canvasInformations.rectangleInitialY, width, height);
            }
        }
    }

    drawRectangle(): void {
        this.canvasInformations.originalRectangleCanvas.addEventListener('mousedown', this.rectangleListener[0]);
        this.canvasInformations.differenceRectangleCanvas.addEventListener('mousedown', this.rectangleListener[0]);

        this.canvasInformations.originalRectangleCanvas.addEventListener('mouseup', this.rectangleListener[1]);
        this.canvasInformations.differenceRectangleCanvas.addEventListener('mouseup', this.rectangleListener[1]);

        this.canvasInformations.originalRectangleCanvas.addEventListener('mousemove', this.rectangleListener[2]);
        this.canvasInformations.differenceRectangleCanvas.addEventListener('mousemove', this.rectangleListener[2]);
    }
}
