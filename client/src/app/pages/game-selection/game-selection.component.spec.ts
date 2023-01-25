import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { GAME_CARDS_TO_DISPLAY } from './game-selection-constants';
import { GameSelectionComponent } from './game-selection.component';

describe('GameSelectionComponent', () => {
    let component: GameSelectionComponent;
    let fixture: ComponentFixture<GameSelectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameSelectionComponent],
            imports: [RouterTestingModule],
        }).compileComponents();

        fixture = TestBed.createComponent(GameSelectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('show-next-cards-button should put the end Index at 4 more than index until there is less than 4 other gameCards to show', () => {
        component.endIndex = 4;
        component.numberOfGameInformations = 5;
        component.selectGameCards();
        expect(component.endIndex).toBe(component.index + GAME_CARDS_TO_DISPLAY);
        fixture.debugElement.query(By.css('#show-next-cards-button')).triggerEventHandler('click', null);
        expect(component.endIndex).toBe(component.index + 1);
    });

    it('show-previous-cards-button should not call selectGameCards() if index is 0', () => {
        component.selectGameCards = jasmine.createSpy();
        fixture.debugElement.query(By.css('#show-previous-cards-button')).triggerEventHandler('click', null);
        expect(component.selectGameCards).not.toHaveBeenCalled();
    });

    it('show-previous-cards-button should call selectGameCards() if index is different than 0', () => {
        component.index = 4;
        component.endIndex = 5;
        component.selectGameCards = jasmine.createSpy();
        fixture.debugElement.query(By.css('#show-previous-cards-button')).triggerEventHandler('click', null);
        expect(component.selectGameCards).toHaveBeenCalled();
    });

    it('show-next-cards-button should not call selectGameCards() if EndIndex is equal to numberOfGameInformations', () => {
        component.selectGameCards = jasmine.createSpy();
        fixture.debugElement.query(By.css('#show-next-cards-button')).triggerEventHandler('click', null);
        expect(component.selectGameCards).not.toHaveBeenCalled();
    });

    it('show-next-cards-button should call selectGameCards() if endIndex is different than numberOfGameInformations', () => {
        component.endIndex = 4;
        component.numberOfGameInformations = 5;
        component.selectGameCards = jasmine.createSpy();
        fixture.debugElement.query(By.css('#show-next-cards-button')).triggerEventHandler('click', null);
        expect(component.selectGameCards).toHaveBeenCalled();
    });

    // it('show-previous-cards-button should be disabled with index = 0', () => {
    //     expect(fixture.nativeElement.querySelector('#show-previous-cards-button').disabled).toBeTruthy();
    // });

    // it('show-previous-cards-button should be activated if there is previous gameInformations to show', () => {
    //     component.index = 4;
    //     component.endIndex = 8;
    //     expect(fixture.nativeElement.querySelector('#show-previous-cards-button').disabled).toBeFalsy();
    // });

    // it('show-next-cards-button should be disabled on load for 4 or less gameInformations available', () => {
    //     component.endIndex = 4;
    //     component.numberOfGameInformations = 4;
    //     expect(fixture.nativeElement.querySelector('#show-next-cards-button').disabled).toBeTruthy();
    // });

    // it('show-next-cards-button should be activated if there is more gameInformations to show', () => {
    //     component.endIndex = 4;
    //     component.numberOfGameInformations = 5;
    //     console.log(component.endIndex);
    //     console.log(component.isShowingLastCard());
    //     expect(fixture.debugElement.nativeElement.querySelector('#show-next-cards-button').disabled).toBeFalsy();
    // });
});
