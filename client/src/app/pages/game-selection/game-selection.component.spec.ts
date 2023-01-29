import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { game, GameCardInformation } from '@common/game-card';
import { Subject } from 'rxjs';
import { GAME_CARDS_TO_DISPLAY } from './game-selection-constants';
import { GameSelectionComponent } from './game-selection.component';

describe('GameSelectionComponent', () => {
    let component: GameSelectionComponent;
    let fixture: ComponentFixture<GameSelectionComponent>;
    let mockService: GameCardInformationService;
    let testNumber: Subject<number>;
    let testGameCardsInformation: Subject<GameCardInformation[]>;

    beforeEach(() => {
        testNumber = new Subject<number>();
        mockService = jasmine.createSpyObj('GameCardInformationService', ['getGameCardsInformation', 'getNumberOfGameCardInformation']);
        mockService.getNumberOfGameCardInformation = () => {
            testNumber.next(GAME_CARDS_TO_DISPLAY);
            return testNumber.asObservable();
        };

        testGameCardsInformation = new Subject<GameCardInformation[]>();
        mockService.getGameCardsInformations = () => {
            testGameCardsInformation.next([game, game, game, game]);
            return testGameCardsInformation.asObservable();
        };

        TestBed.configureTestingModule({
            declarations: [GameSelectionComponent],
            imports: [RouterTestingModule],
            providers: [{ provide: GameCardInformationService, useValue: mockService }],
        }).compileComponents();

        fixture = TestBed.createComponent(GameSelectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('selectGameCards() should put the endIndex at 4 more than index until there is less than 4 other gameCards to show', () => {
        component.endIndex = 4;
        component.numberOfGameInformations = 5;
        component.selectGameCards();
        expect(component.endIndex).toBe(component.index + GAME_CARDS_TO_DISPLAY);
        component.nextCards();
        expect(component.endIndex).toBe(component.index + 1);
    });

    it('previousCards() should not call selectGameCards() if index is 0', () => {
        component.selectGameCards = jasmine.createSpy();
        component.previousCards();
        expect(component.selectGameCards).not.toHaveBeenCalled();
    });

    it('previousCards() should call selectGameCards() if index is different than 0', () => {
        component.index = 4;
        component.endIndex = 5;
        component.selectGameCards = jasmine.createSpy();
        component.previousCards();
        expect(component.selectGameCards).toHaveBeenCalled();
    });

    it('nextCards() should not call selectGameCards() if EndIndex is equal to numberOfGameInformations', () => {
        component.endIndex = 4;
        component.numberOfGameInformations = component.endIndex;
        component.selectGameCards = jasmine.createSpy();
        component.nextCards();
        expect(component.selectGameCards).not.toHaveBeenCalled();
    });

    it('nextCards() should call selectGameCards() if endIndex is different than numberOfGameInformations', () => {
        component.endIndex = 4;
        component.numberOfGameInformations = 5;
        component.selectGameCards = jasmine.createSpy();
        component.nextCards();
        expect(component.selectGameCards).toHaveBeenCalled();
    });

    it('isShowingFirstCard() should return false unless index is 0', () => {
        component.index = 4;
        expect(component.isShowingFirstCard()).toBeFalsy();
        component.index = 0;
        expect(component.isShowingFirstCard()).toBeTruthy();
    });

    it('isShowingLastCard() should return false unless endIndex is the same as numberOfGameInformations', () => {
        component.numberOfGameInformations = 5;
        component.endIndex = 4;
        expect(component.isShowingLastCard()).toBeFalsy();
        component.endIndex = component.numberOfGameInformations;
        expect(component.isShowingLastCard()).toBeTruthy();
    });
});
