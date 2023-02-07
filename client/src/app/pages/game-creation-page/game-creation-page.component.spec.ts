import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameCreationPageComponent } from './game-creation-page.component';

describe('GameCreationPageComponent', () => {
    let component: GameCreationPageComponent;
    let fixture: ComponentFixture<GameCreationPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCreationPageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GameCreationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
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
    // it('should clear the single file', () => {});
    // it('should clear the first file', () => {});
    // it('should clear the second file', () => {});
    // it('should validate the file', () => {});
});
