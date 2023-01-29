import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent {
    @ViewChild('canvas1') myOgCanvas: ElementRef;
    @ViewChild('canvas2') myDiffCanvas: ElementRef;
    urlOriginal: string;
    urlDifferent: string;

    constructor() {}

    ngOnInit(): void {}

    // #drawRectangle(context: CanvasRenderingContext2D) {
    //     context.fillRect(20, 20, 100, 100);
    // }

    clear(e: Event) {
        const ogCanvas: HTMLCanvasElement = this.myOgCanvas.nativeElement;
        const diffCanvas: HTMLCanvasElement = this.myDiffCanvas.nativeElement;

        const ogContext = ogCanvas.getContext('2d');
        const diffContext = diffCanvas.getContext('2d');

        const target = e.target as HTMLInputElement;
        if (target.id === 'reset-original') {
            // this.urlOriginal = '';
            const input = document.getElementById('upload-original') as HTMLInputElement;
            input.value = '';
            if (ogContext) ogContext.clearRect(0, 0, 640, 480);
        } else {
            // this.urlDifferent = '';
            const input = document.getElementById('upload-different') as HTMLInputElement;
            input.value = '';
            if (diffContext) diffContext.clearRect(0, 0, 640, 480);
        }
    }

    fileValidation(e: Event) {
        const ogCanvas: HTMLCanvasElement = this.myOgCanvas.nativeElement;
        const diffCanvas: HTMLCanvasElement = this.myDiffCanvas.nativeElement;

        const ogContext = ogCanvas.getContext('2d');
        const diffContext = diffCanvas.getContext('2d');

        const target = e.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        if (file !== undefined && file.size === 921654 && file.type === 'image/bmp') {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const img = new Image();
                img.src = reader.result as string;
                img.onload = () => {
                    if (img.naturalWidth !== 640 && img.naturalHeight !== 480) {
                        alert('wrong size');
                    } else {
                        switch (target.id) {
                            case 'upload-original': {
                                // this.urlOriginal = reader.result as string;
                                if (ogContext) {
                                    ogContext.drawImage(img, 0, 0, 640, 480);
                                }
                                break;
                            }
                            case 'upload-different': {
                                // this.urlDifferent = reader.result as string;
                                if (diffContext) {
                                    diffContext.drawImage(img, 0, 0, 640, 480);
                                }

                                break;
                            }
                            case 'upload-both': {
                                // this.urlOriginal = reader.result as string;
                                // this.urlDifferent = reader.result as string;
                                if (ogContext) {
                                    ogContext.drawImage(img, 0, 0, 640, 480);
                                }
                                if (diffContext) {
                                    diffContext.drawImage(img, 0, 0, 640, 480);
                                }
                                break;
                            }
                            // No default
                        }
                    }
                };
            };
        } else {
            alert('wrong size or file type please choose again');
            this.urlOriginal = '';
            this.urlDifferent = '';
            target.value = '';
        }
    }
}
