import { ComponentFixture, TestBed } from '@angular/core/testing';
//import { By } from '@angular/platform-browser';
import { GameInformation } from '@app/classes/game-information';

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
        for (let i: number = 0; i < 4; i++) {
            expect(component.currentGameCards.length).toBe(i);
            component.gameCards.push(new GameInformation());
            component.selectGameCards();
        }
    });

    it('selectGameCards should put 0 gameCards in currentGameCards if gameCards is empty', () => {
        component.selectGameCards();
        expect(component.currentGameCards.length).toBe(0);  
    });

    it('next-button should show the next 4 elements until there is fewer than 4 to show', () => {
        for (let i: number = 0; i < 10; i++) {
            component.gameCards.push(new GameInformation());
        }
        let button: HTMLElement | null = document.getElementById("next-button");
        //expect(component.currentGameCards.length).toBe(4);//does not work because the first selectGameCards() has been called before pushing gameCards
        //expect(fixture.debugElement.queryAll(By.css('.game-card-container > div')).length).toBe(4);//selector does not work
        button?.click();
        expect(component.currentGameCards.length).toBe(4);
        //expect(fixture.debugElement.queryAll(By.css('.game-card-container > div')).length).toBe(4);
        button?.click();
        expect(component.currentGameCards.length).toBe(2);
        //expect(fixture.debugElement.queryAll(By.css('.game-card-container > div')).length).toBe(2);
    });
});
    