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
        const image = new Image();
        image.src = 'https://www.trbimg.com/img-563bb6ac/turbine/ct-tests-ten-things-perspec-1108-20151105';
        if (context) {
            image.onload = () => {
                context.drawImage(image, 0, 0);
            };
        }
    }

    drawRectangle(context: CanvasRenderingContext2D): void {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        context.fillRect(100, 100, this.squareDimensions, this.squareDimensions);
    }
}
