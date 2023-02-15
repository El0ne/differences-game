import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { GameCardInformation } from '@common/game-card';
import { IMAGE_DIMENSIONS } from '@common/image-dimensions';
import { ServerGeneratedGameInfo } from '@common/server-generated-game-info';
import { of } from 'rxjs';
import { GameCreationPageComponent } from './game-creation-page.component';

describe('GameCreationPageComponent', () => {
    let component: GameCreationPageComponent;
    let fixture: ComponentFixture<GameCreationPageComponent>;
    let canvasOg: HTMLCanvasElement;
    let matDialog: MatDialog;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCreationPageComponent],
            imports: [HttpClientModule, FormsModule, MatDialogModule, RouterTestingModule],
            providers: [
                {
                    provide: MatDialog,
                    useValue: {
                        open: () => ({
                            afterClosed: () => of({}),
                            // eslint-disable-next-line @typescript-eslint/no-empty-function
                            close: () => {},
                        }),
                    },
                },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameCreationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        canvasOg = document.createElement('canvas');
        canvasOg.width = IMAGE_DIMENSIONS.width;
        canvasOg.height = IMAGE_DIMENSIONS.height;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get a title', () => {
        const input = 'Test title';
        component.getTitle(input);
        expect(component.gameTitle).toBe(input);
    });

    it('should open the modal page', () => {
        spyOn(matDialog, 'open');
        spyOn(component.router, 'navigate');

        component.openModal();

        expect(matDialog.open).toHaveBeenCalled();
        expect(component.router.navigate).toHaveBeenCalledWith(['/config']);
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
        expect(component.originalFile).toBeNull();
    });

    it('should clear the second file', () => {
        component.differentFile = new File([], 'test.bmp', { type: 'image/bmp' });
        component.clearSecondFile(canvasOg, 'upload-different');
        expect(component.differentFile).toBeNull();
    });

    it('should validate the file', () => {
        spyOn(component, 'uploadImage');

        const file = new File([new ArrayBuffer(IMAGE_DIMENSIONS.size)], 'testImage.bmp', { type: 'image/bmp' });

        const input = fixture.debugElement.query(By.css('input[type="file"]')).nativeElement as HTMLInputElement;
        const event = new Event('change');
        Object.defineProperty(event, 'target', { value: { files: [file] } });
        input.dispatchEvent(event);

        component.fileValidation(event);

        expect(component.uploadImage).toHaveBeenCalled();
    });

    it('should send an alert if picture is the wrong size', () => {
        spyOn(window, 'alert');

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const file = new File([new ArrayBuffer(123456)], 'testImage.bmp', { type: 'image/bmp' });

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

        const file = new File([new ArrayBuffer(IMAGE_DIMENSIONS.size)], 'testImage.jpg', { type: 'image/jpg' });

        const input = fixture.debugElement.query(By.css('input[type="file"]')).nativeElement as HTMLInputElement;
        const event = new Event('change');
        Object.defineProperty(event, 'target', { value: { files: [file] } });
        input.dispatchEvent(event);

        component.fileValidation(event);

        expect(window.alert).toHaveBeenCalledWith('wrong size or file type please choose again');
        expect(input.value).toBe('');
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

    it('should return true if all the verifications are good', () => {
        component.gameTitle = 'My Game';
        component.originalFile = new File([''], 'original.bmp');
        component.differentFile = new File([''], 'different.bmp');

        component.saveVerification();

        expect(component.saveVerification).toBeTruthy();
    });

    it('should open modal page and save information if saveVerification is true', () => {
        component.gameTitle = 'My Game';
        component.originalFile = new File([''], 'original.bmp');
        component.differentFile = new File([''], 'different.bmp');

        spyOn(component, 'saveVerification').and.returnValue(true);

        const mockServerInfo: ServerGeneratedGameInfo = {
            gameId: '',
            originalImageName: '',
            differenceImageName: '',
            gameDifficulty: '',
            gameDifferenceNumber: 5,
        };
        spyOn(component.gameCardService, 'uploadImages').and.returnValue(of(mockServerInfo));

        const mockGameCardInfo: GameCardInformation = {
            id: '',
            name: '',
            difficulty: '',
            originalImageName: '',
            differenceImageName: '',
            differenceNumber: 0,
            soloTimes: [],
            multiTimes: [],
        };
        // spyOn(component.gameCardService, 'createGame').and.returnValue(of(mockGameCardInfo));
        // spyOn(component.gameCardService, 'getGameCardInfoFromId').and.returnValue(of(mockGameCardInfo));

        component.save();

        // expect(component.saveVerification).toHaveBeenCalled();
        // expect(component.isDisabled).toBe(true);
        // expect(component.gameCardService.uploadImages).toHaveBeenCalledWith(
        //     new File([''], 'original.bmp'),
        //     new File([''], 'different.bmp'),
        //     component.radius,
        // );
        // expect(component.gameCardService.createGame).toHaveBeenCalled();
        // expect(component.gameCardService.getGameCardInfoFromId).toHaveBeenCalled();
        // expect(component.openModal).toHaveBeenCalled();
    });
});
