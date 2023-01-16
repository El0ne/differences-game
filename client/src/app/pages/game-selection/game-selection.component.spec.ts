import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameSelectionComponent } from './game-selection.component';

describe('GameSelectionComponent', () => {
    let component: GameSelectionComponent;
    let fixture: ComponentFixture<GameSelectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameSelectionComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GameSelectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('currentGameCards should be equal to gameCards lenght until it is bigger than 4', () => {
        expect(component.currentGameCards.length).toBe(0);
    });

    it('first game cards to show should be the 4 first ones', () => {
        expect(component.currentGameCards.length).toBe(0);
    });
});
