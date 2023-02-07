import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'app-test',
    templateUrl: './test.component.html',
    styleUrls: ['./test.component.scss'],
})
export class TestComponent implements OnInit {
    // @ViewChild('canvas1') myCanvas1: ElementRef;

    // @ViewChild('canvas2') myCanvas2: ElementRef;

    @ViewChild('canvas3') myCanvas3: ElementRef;

    constructor() {}

    ngOnInit(): void {
        // const canvas1: HTMLCanvasElement = this.myCanvas1.nativeElement;
        // const context1 = canvas1.getContext('2d');
        // const canvas2: HTMLCanvasElement = this.myCanvas2.nativeElement;
        // const context2 = canvas2.getContext('2d');
        // const canvas3: HTMLCanvasElement = this.myCanvas3.nativeElement;
        // const context3 = canvas3.getContext('2d');
        this.processImages();
    }

    processImages() {
        const img1 = new Image();
        const img2 = new Image();

        img1.src = '../../../assets/image_7_diff.png';
        img2.src = '../../../assets/image_12_diff.png';

        const canvas3: HTMLCanvasElement = this.myCanvas3.nativeElement;
        const context3 = canvas3.getContext('2d');

        if (context3) {
            context3.drawImage(img1, 0, 0, 640, 480);
            // context3.globalCompositeOperation = 'difference';
            // const pat1 = context3.createPattern(img1, 'no-repeat');
            // const pat2 = context3.createPattern(img2, 'no-repeat');

            // if (pat1) context3.fillStyle = pat1;
            // context3.fillRect(0, 0, 640, 480);

            // if (pat2) context3.fillStyle = pat2;
            // context3.fillRect(0, 0, 640, 480);
        }
    }
}
