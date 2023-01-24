import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'app-image-comparison',
    templateUrl: './image-comparison.component.html',
    styleUrls: ['./image-comparison.component.scss'],
})
export class ImageComparisonComponent implements OnInit {
    @ViewChild('canvas', { static: true }) myCanvas!: ElementRef;
    squareDimensions: number = 10;
    ngOnInit(): void {
        const canvas: HTMLCanvasElement = this.myCanvas.nativeElement;
        const context = canvas.getContext('2d');
        if (context) {
            this.drawRectangle(context);
        }
    }

    drawRectangle(context: CanvasRenderingContext2D): void {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        context.fillRect(100, 100, this.squareDimensions, this.squareDimensions);
    }
}
