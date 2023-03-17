import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DrawingRectangleService {
    constructor() {}
    // startDrawingRectangle(mouseEvent: MouseEvent): void {
    //     const canvas = this.drawingCanvas2.getBoundingClientRect();
    //     this.isUserClicking = true;

    //     this.rectangleInitialX = mouseEvent.clientX - canvas.left;
    //     this.rectangleInitialY = mouseEvent.clientY - canvas.top;
    // }

    // stopDrawingRectangle(): void {
    //     const firstContext = this.drawingCanvas1.getContext('2d');
    //     const secondContext = this.drawingCanvas2.getContext('2d');
    //     this.isUserClicking = false;

    //     if (firstContext) firstContext.drawImage(this.drawingCanvas2, 0, 0);
    //     if (secondContext) secondContext.clearRect(0, 0, this.drawingCanvas2.width, this.drawingCanvas2.height);

    //     this.pushCanvas(this.drawingCanvas1);
    // }

    // paintRectangle(mouseEvent: MouseEvent): void {
    //     this.choseCanvas(mouseEvent);
    //     const context = this.drawingCanvas2.getContext('2d');

    //     if (context && this.isUserClicking) {
    //         const canvas = this.drawingCanvas2.getBoundingClientRect();
    //         context.fillStyle = this.selectedColor;
    //         context.clearRect(0, 0, this.drawingCanvas2.width, this.drawingCanvas2.height);

    //         const width = mouseEvent.clientX - canvas.left - this.rectangleInitialX;
    //         const height = mouseEvent.clientY - canvas.top - this.rectangleInitialY;

    //         if (mouseEvent.shiftKey) {
    //             const size = Math.min(Math.abs(width), Math.abs(height));
    //             const signX = Math.sign(width);
    //             const signY = Math.sign(height);
    //             context.fillRect(this.rectangleInitialX, this.rectangleInitialY, size * signX, size * signY);
    //         } else {
    //             context.fillRect(this.rectangleInitialX, this.rectangleInitialY, width, height);
    //         }
    //     }
    // }

    // drawRectangle(): void {
    //     this.originalRectangleCanvas.nativeElement.addEventListener('mousedown', this.rectangleListener[0]);
    //     this.differenceRectangleCanvas.nativeElement.addEventListener('mousedown', this.rectangleListener[0]);

    //     this.originalRectangleCanvas.nativeElement.addEventListener('mouseup', this.rectangleListener[1]);
    //     this.differenceRectangleCanvas.nativeElement.addEventListener('mouseup', this.rectangleListener[1]);

    //     this.originalRectangleCanvas.nativeElement.addEventListener('mousemove', this.rectangleListener[2]);
    //     this.differenceRectangleCanvas.nativeElement.addEventListener('mousemove', this.rectangleListener[2]);
    // }
}
