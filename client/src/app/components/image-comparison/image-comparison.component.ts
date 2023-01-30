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

    getMyImageData(image: HTMLImageElement): Uint8ClampedArray {
        const myCanvas = document.createElement('canvas');
        myCanvas.height = image.height;
        myCanvas.width = image.width;
        const imageContext = myCanvas.getContext('2d');
        if (imageContext) {
            imageContext.drawImage(image, 0, 0);
            return imageContext.getImageData(0, 0, image.width, image.height).data;
        } else {
            throw new Error('Context is undefined');
        }
    }

    compareImages(image1: HTMLImageElement, image2: HTMLImageElement): boolean[] {
        const firstImageData = this.getMyImageData(image1);
        const secondImageData = this.getMyImageData(image2);
        const differentPixels: boolean[] = [];
        for (let i = 0; i < firstImageData.length; i++) {
            if (firstImageData[i] !== secondImageData[i]) {
                differentPixels.push(true);
            } else {
                differentPixels.push(false);
            }
        }
        return differentPixels;
    }

    /*
    generateDifferenceImage(image1: HTMLImageElement, image2: HTMLImageElement): HTMLImageElement {
        const differentPixels = this.compareImages(image1, image2);
        const canvas = document.createElement('canvas');
        canvas.height = image1.height;
        canvas.width = image1.width;
        const context = canvas.getContext('2d');
        if (context) {
            // commenter 
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image1, 0, 0);
            // decommenter
            const differencesImage = context.getImageData(0, 0, image1.width, image1.height);
            for (let i = 0; i < differencesImage.data.length; i++) {
                if (differentPixels[i] === false) {
                    differencesImage.data[i].push(#FFFFFF);
                }
                else {
                    differencesImage.data[i].push(#000000);
                }
            }
            // commenter
            context.putImageData(differencesImage, 0, 0);
            return canvas;
            // decommenter
            return differencesImage;
        }
*/
}
