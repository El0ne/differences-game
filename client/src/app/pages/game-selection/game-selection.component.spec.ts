import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { By } from '@angular/platform-browser';
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

    it('slice of gameCards should be equal to gameCards lenght until it is bigger than 4', () => {
        for (let i = 0; i < 4; i++) {
            expect(component.endIndex - component.index).toBe(i);
            component.gameCards.push(new GameInformation());
            component.selectGameCards();
        }
        component.gameCards.push(new GameInformation());
        component.selectGameCards();
        expect(component.endIndex - component.index).toBe(4);
    });

    it('show-next-cards-button should show the next 4 elements until there is fewer than 4 to show', () => {
        for (let i = 0; i < 10; i++) {
            component.gameCards.push(new GameInformation());
        }
        component.selectGameCards();
        expect(component.endIndex - component.index).toBe(4);
        component.nextCards();
        expect(component.endIndex - component.index).toBe(4);
        component.nextCards();
        expect(component.endIndex - component.index).toBe(2);
    });

    // it('nextCards() should show the next 4 cards in the list', () => {
    //     for (let i = 0; i < 8; i++) {
    //         const testInsertGameInformation: GameInformation = new GameInformation();
    //         testInsertGameInformation.testNumber = 4;
    //         component.gameCards.push(new GameInformation());
    //     }
    // });

    it('show-previous-cards-button should be disabled on load', () => {
        // fixture.nativeElement.querySelector('#show-previous-cards-button').disabled;
        expect(fixture.nativeElement.querySelector('#show-previous-cards-button').disabled).toBeTruthy();
    });

    it('show-previous-cards-button should be activated if there is previous gameInformations to show', () => {
        for (let i = 0; i < 5; i++) {
            component.gameCards.push(new GameInformation());
        }
        component.nextCards();
        expect(fixture.nativeElement.querySelector('#show-previous-cards-button').disabled).toBeFalsy();
    });

    it('show-next-cards-button should be disabled on load for 4 or less gameInformations available', () => {
        expect(fixture.nativeElement.querySelector('#show-next-cards-button').disabled).toBeTruthy();
    });

    it('show-next-cards-button should be activated if there is more gameInformations to show', () => {
        for (let i = 0; i < 9; i++) {
            component.gameCards.push(new GameInformation());
        }
        component.nextCards();
        expect(fixture.nativeElement.querySelector('#show-next-cards-button').disabled).toBeFalsy();
    });
});
