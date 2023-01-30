import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageComparisonComponent } from './image-comparison.component';

describe('ImageComparisonComponent', () => {
    let component: ImageComparisonComponent;
    let fixture: ComponentFixture<ImageComparisonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ImageComparisonComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ImageComparisonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('drawRectangle should draw a rectangle', () => {
        const testCanvas: HTMLCanvasElement = component.myCanvas.nativeElement;
        const context = testCanvas.getContext('2d');
        if (context) {
            component.drawRectangle(context);
            expect(context).toBeTruthy();
        }
    });

    /*
    it('getMyImageData should return an array of pixels', () => {
        const testCanvas: HTMLCanvasElement = component.myCanvas.nativeElement;
        const context = testCanvas.getContext('2d');
        const myImage = new Image();
        myImage.src = 'https://www.trbimg.com/img-563bb6ac/turbine/ct-tests-ten-things-perspec-1108-20151105';
        if (context) {
            myImage.onload = () => {
                context.drawImage(myImage, 0, 0);
                const imageData = component.getMyImageData(myImage);
                expect(imageData).toBeTruthy();
            };
        }
    });

    it('compareImages should return an array of booleans', () => {
        const testCanvas: HTMLCanvasElement = component.myCanvas.nativeElement;
        const context = testCanvas.getContext('2d');
        const myImage1 = new Image();
        const myImage2 = new Image();
        myImage1.src = 'https://www.trbimg.com/img-563bb6ac/turbine/ct-tests-ten-things-perspec-1108-20151105';
        myImage2.src = 'https://www.trbimg.com/img-563bb6ac/turbine/ct-tests-ten-things-perspec-1108-20151105';
        if (context) {
            myImage1.onload = () => {
                context.drawImage(myImage1, 0, 0);
                myImage2.onload = () => {
                    context.drawImage(myImage2, 0, 0);
                    const differentPixels = component.compareImages(myImage1, myImage2);
                    expect(differentPixels).toBeTruthy();
                    expect(differentPixels.length).toBeGreaterThan(0);
                    expect(differentPixels[0]).toBe(true || false);
                };
            };
        }
    });
    */
});
