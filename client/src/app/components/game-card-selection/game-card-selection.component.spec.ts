import { ComponentFixture, TestBed } from '@angular/core/testing';
import { game, GameCardInformation } from '@app/Classes/game-card';

import { GameCardSelectionComponent } from './game-card-selection.component';

describe('GameCardSelectionComponent', () => {
    let component: GameCardSelectionComponent;
    let fixture: ComponentFixture<GameCardSelectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCardSelectionComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GameCardSelectionComponent);
        component = fixture.componentInstance;
        component.gameCardInformation = new GameCardInformation();
        fixture.detectChanges();

        component.gameCardInformation = game;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
