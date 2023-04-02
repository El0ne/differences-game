/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { GameConstantsService } from '@app/services/game-constants/game-constants.service';
import { getDefaultGameConstants } from '@common/game-constants';
import { Observable, of } from 'rxjs';

import { GameConstantsComponent } from './game-constants.component';

describe('GameConstantsComponent', () => {
    let component: GameConstantsComponent;
    let fixture: ComponentFixture<GameConstantsComponent>;
    let gameConstantsService: GameConstantsService;
    let gameCardService: GameCardInformationService;

    beforeEach(async () => {
        gameConstantsService = jasmine.createSpyObj('GameConstantsService', ['getGameConstants', 'updateGameConstants']);
        gameConstantsService.getGameConstants = () => {
            return of(getDefaultGameConstants());
        };
        gameConstantsService.updateGameConstants = () => {
            return of();
        };

        gameCardService = jasmine.createSpyObj('GameCardInformationService', ['resetAllBestTimes', 'deleteAllGames']);

        gameCardService.resetAllBestTimes = () => {
            return of();
        };

        gameCardService.deleteAllGames = () => {
            return of();
        };

        await TestBed.configureTestingModule({
            declarations: [GameConstantsComponent],
            imports: [HttpClientTestingModule, FormsModule],
            providers: [
                { provide: GameConstantsService, useValue: gameConstantsService },
                { provide: GameCardInformationService, useValue: gameCardService },
                // GameCardInformationService,
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameConstantsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        gameCardService = TestBed.inject(GameCardInformationService) as jasmine.SpyObj<GameCardInformationService>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('it should set the game constants on ngOnInit', () => {
        spyOn(gameConstantsService, 'getGameConstants').and.returnValue(of(getDefaultGameConstants()));

        fixture.detectChanges();

        expect(component.gameConstants).toEqual(getDefaultGameConstants());
    });

    it('updateGameConstants() should call updateGameConstants from the service', () => {
        spyOn(gameConstantsService, 'updateGameConstants').and.returnValue(of(undefined));

        component.gameConstants = getDefaultGameConstants();
        component.updateGameConstants();

        expect(gameConstantsService.updateGameConstants).toHaveBeenCalledWith(getDefaultGameConstants());
    });

    it('resetGameConstants() should reset gameConstants call updateGameConstants ', () => {
        spyOn(component, 'updateGameConstants');

        component.gameConstants = {
            countDown: -0,
            hint: -0,
            difference: -0,
        };
        component.resetGameConstants();

        expect(component.gameConstants).toEqual(getDefaultGameConstants());
        expect(component.updateGameConstants).toHaveBeenCalled();
    });

    it('resetAllBestTimes() should call resetAllBestTimes from the service', () => {
        spyOn(gameCardService, 'resetAllBestTimes').and.returnValue(new Observable<void>());

        component.resetAllBestTimes();

        expect(gameCardService.resetAllBestTimes).toHaveBeenCalled();
    });

    it('deleteAllGames() should call deleteAllGames from the service', fakeAsync(() => {
        spyOn(gameCardService, 'deleteAllGames').and.returnValue(new Observable<void>());

        component.deleteAllGames();

        expect(gameCardService.deleteAllGames).toHaveBeenCalled();
    }));

    it('checkNumber() should return a number between the min and max value for the input', () => {
        const fakeFocusEvent = {
            target: { value: 33 },
        } as unknown as FocusEvent;

        let returnValue = component.checkNumber(fakeFocusEvent, 0, 100);
        expect(returnValue).toEqual(33);

        returnValue = component.checkNumber(fakeFocusEvent, 0, 10);
        expect(returnValue).toEqual(10);

        returnValue = component.checkNumber(fakeFocusEvent, 35, 100);
        expect(returnValue).toEqual(35);
    });
});
