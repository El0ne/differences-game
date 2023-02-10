import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { GameCreationPageComponent } from './game-creation-page.component';

describe('GameCreationPageComponent', () => {
    let component: GameCreationPageComponent;
    let fixture: ComponentFixture<GameCreationPageComponent>;
    let canvas: HTMLCanvasElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCreationPageComponent],
            imports: [HttpClientModule, FormsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(GameCreationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should get a title', () => {
        // const inputElement = fixture.debugElement.query(By.css('input[name=title]')).nativeElement;
        // spyOn(component, 'getTitle');

        const input = 'Test title';

        // inputElement.dispatchEvent(new Event('input'));
        // inputElement.dispatchEvent(new Event('keyup'));
        // fixture.detectChanges();
        component.getTitle(input);
        expect(component.gameTitle).toBe(input);
    });
    it('should clear the single file', () => {
        component.clearSingleFile(canvas, 'upload-original');

        const context = canvas.getContext('2d');
        let validate = false;
        if (context) validate = !context.getImageData(0, 0, canvas.width, canvas.height).data.some((channel: number) => channel !== 0);

        const input = document.getElementById('upload-original') as HTMLInputElement;
        const bothInput = document.getElementById('upload-both') as HTMLInputElement;

        expect(validate).toBe(true);
        expect(input.value).toEqual('');
        expect(bothInput.value).toEqual('');
    });
    it('should clear the first file', () => {
        component.originalFile = new File([], 'test.bmp', { type: 'image/bmp' });
        component.clearFirstFile(canvas, 'upload-original');
        expect(component.originalFile === null).toBe(true);
    });
    it('should clear the second file', () => {
        component.differentFile = new File([], 'test.bmp', { type: 'image/bmp' });
        component.clearSecondFile(canvas, 'upload-different');
        expect(component.differentFile === null).toBe(true);
    });
    // it('should validate the file', () => {});
});
