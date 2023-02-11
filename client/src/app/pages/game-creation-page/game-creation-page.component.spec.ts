import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { GameCreationPageComponent } from './game-creation-page.component';

describe('GameCreationPageComponent', () => {
    let component: GameCreationPageComponent;
    let fixture: ComponentFixture<GameCreationPageComponent>;
    let canvasOg: HTMLCanvasElement;
    // let gameCardService: GameCardInformationService;

    // let spyOgContext: jasmine.SpyObj<CanvasRenderingContext2D>;
    // let spyDiffContext: jasmine.SpyObj<CanvasRenderingContext2D>;
    // let spyFileReader: jasmine.SpyObj<FileReader>;
    // let spyImg: jasmine.SpyObj<HTMLImageElement>;
    // let canvasDiff: HTMLCanvasElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCreationPageComponent],
            imports: [HttpClientModule],
        }).compileComponents();

        fixture = TestBed.createComponent(GameCreationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        canvasOg = document.createElement('canvas');
        canvasOg.width = 640;
        canvasOg.height = 480;

        // gameCardService = new GameCardInformationService();

        // spyOgContext = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', ['drawImage']);
        // spyDiffContext = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', ['drawImage']);

        // spyFileReader = jasmine.createSpyObj<FileReader>('FileReader', ['readAsDataURL', 'onload']);

        // spyImg = jasmine.createSpyObj<HTMLImageElement>('HTMLImageElement', ['onload']);

        // component.myOgCanvas = { nativeElement: { getContext: () => spyOgContext } } as unknown;
        // component.myDiffCanvas = { nativeElement: { getContext: () => spyDiffContext } } as unknown;
        // canvasDiff = document.createElement('canvas');
        // canvasDiff.width = 640;
        // canvasDiff.height = 480;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get a title', () => {
        const input = 'Test title';
        component.getTitle(input);
        expect(component.gameTitle).toBe(input);
    });

    it('should clear the single file', () => {
        component.clearSingleFile(canvasOg, 'upload-original');

        const context = canvasOg.getContext('2d');
        let validate = false;
        if (context) validate = !context.getImageData(0, 0, canvasOg.width, canvasOg.height).data.some((channel: number) => channel !== 0);

        const input = document.getElementById('upload-original') as HTMLInputElement;
        const bothInput = document.getElementById('upload-both') as HTMLInputElement;

        expect(validate).toBe(true);
        expect(input.value).toEqual('');
        expect(bothInput.value).toEqual('');
    });

    it('should clear the first file', () => {
        component.originalFile = new File([], 'test.bmp', { type: 'image/bmp' });
        component.clearFirstFile(canvasOg, 'upload-original');
        expect(component.originalFile).toBeNull(); // not working, looking how to correct it
    });

    it('should clear the second file', () => {
        // this test passes but not good
        component.differentFile = new File([], 'test.bmp', { type: 'image/bmp' });
        component.clearSecondFile(canvasOg, 'upload-different');
        expect(component.differentFile).toBeNull();
    });

    it('should validate the file', () => {
        spyOn(component, 'uploadImage');

        const file = new File([new ArrayBuffer(921654)], 'testImage.bmp', { type: 'image/bmp' });

        const input = fixture.debugElement.query(By.css('input[type="file"]')).nativeElement as HTMLInputElement;
        const event = new Event('change');
        Object.defineProperty(event, 'target', { value: { files: [file] } });
        input.dispatchEvent(event);

        component.fileValidation(event);

        expect(component.uploadImage).toHaveBeenCalled();
    });

    it('should send an alert if picture is the wrong size', () => {
        spyOn(window, 'alert');

        const file = new File([new ArrayBuffer(111111)], 'testImage.bmp', { type: 'image/bmp' });

        const input = fixture.debugElement.query(By.css('input[type="file"]')).nativeElement as HTMLInputElement;
        const event = new Event('change');
        Object.defineProperty(event, 'target', { value: { files: [file] } });
        input.dispatchEvent(event);

        component.fileValidation(event);

        expect(window.alert).toHaveBeenCalledWith('wrong size or file type please choose again');
        expect(input.value).toBe('');
    });

    it('should send an alert if picture is the wrong type', () => {
        spyOn(window, 'alert');

        const file = new File([new ArrayBuffer(921654)], 'testImage.jpg', { type: 'image/jpg' });

        const input = fixture.debugElement.query(By.css('input[type="file"]')).nativeElement as HTMLInputElement;
        const event = new Event('change');
        Object.defineProperty(event, 'target', { value: { files: [file] } });
        input.dispatchEvent(event);

        component.fileValidation(event);

        expect(window.alert).toHaveBeenCalledWith('wrong size or file type please choose again');
        expect(input.value).toBe('');
    });

    it('should upload original image', () => {
        const file = new File(['test-image'], 'test.bmp', { type: 'image/bmp' });
        const target = { id: 'upload-original', files: [file] } as unknown as HTMLInputElement;

        component.uploadImage(file, target);

        expect(component.originalFile).toEqual(file);
    });

    it('should upload difference image', () => {
        const file = new File([new ArrayBuffer(921654)], 'testImage.bmp', { type: 'image/bmp' });
        const input = document.createElement('input');
        input.setAttribute('id', 'upload-different');

        component.uploadImage(file, input);

        expect(component.differentFile).toEqual(file);
    });

    it('should upload both images', () => {
        const file = new File([new ArrayBuffer(921654)], 'testImage.bmp', { type: 'image/bmp' });
        const input = fixture.debugElement.query(By.css('input[type="file"]')).nativeElement as HTMLInputElement;
        const target = { id: 'upload-both', files: [file] };

        const event = new Event('change');
        Object.defineProperty(event, 'target', { value: target });
        input.dispatchEvent(event);
        fixture.detectChanges();

        console.log(component.originalFile);

        component.uploadImage(file, input);

        expect(component.originalFile).toEqual(file);
        expect(component.differentFile).toEqual(file);
    });

    it('should send an alert if both title and canvas are empty', () => {
        spyOn(window, 'alert');
        component.saveVerification();
        expect(window.alert).toHaveBeenCalledWith('Il manque une image et un titre à votre jeu !');
    });

    it('should send  an alert if only the title is missing', () => {
        spyOn(window, 'alert');

        component.originalFile = new File([], 'test.bmp', { type: 'image/bmp' });
        component.saveVerification();
        expect(window.alert).toHaveBeenCalledWith("N'oubliez pas d'ajouter un titre à votre jeu !");
    });

    it('should send an alert if at least one of the canvas is empty', () => {
        spyOn(window, 'alert');

        const input = 'Test title';
        component.getTitle(input);
        component.saveVerification();
        expect(window.alert).toHaveBeenCalledWith('Un jeu de différences sans image est pour ainsi dire... intéressant ? Ajoutez une image.');
    });

    it('should call the saveVerification method and return false if there is no title or files', () => {
        spyOn(component, 'saveVerification').and.callThrough();
        component.gameTitle = '';
        component.originalFile = null;
        component.differentFile = null;

        expect(component.saveVerification).toHaveBeenCalled();
        expect(component.save()).toBeFalse();
    });

    it('should call the saveVerification method and return false if there is no title', () => {
        spyOn(component, 'saveVerification').and.callThrough();
        component.gameTitle = '';
        component.originalFile = new File([''], 'original.bmp');
        component.differentFile = new File([''], 'different.bmp');

        expect(component.saveVerification).toHaveBeenCalled();
        expect(component.save()).toBeFalse();
    });

    it('should call the saveVerification method and return false if there are no files', () => {
        spyOn(component, 'saveVerification').and.callThrough();
        component.gameTitle = 'testTitle';
        component.originalFile = null;
        component.differentFile = null;

        expect(component.saveVerification).toHaveBeenCalled();
        expect(component.save()).toBeFalse();
    });

    // it('should call the gameCardService.save method and return true if there is a title and files', () => {
    //     spyOn(component, 'saveVerification').and.callThrough();
    //     spyOn(component.gameCardService, 'uploadImages');
    //     component.gameTitle = 'My Game';
    //     component.originalFile = new File([''], 'original.bmp');
    //     component.differentFile = new File([''], 'different.bmp');

    //     expect(component.saveVerification).toHaveBeenCalled();
    //     expect(component.save()).toBeTrue();
    //     expect(component.gameCardService.uploadImages).toHaveBeenCalledWith(
    //         new File([''], 'original.bmp'),
    //         new File([''], 'different.bmp'),
    //         component.radius,
    //     );
    // });
});
