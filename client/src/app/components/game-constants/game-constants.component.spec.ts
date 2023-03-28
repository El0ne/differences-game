/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { GameConstantsService } from '@app/services/game-constants/game-constants.service';
import { DEFAULT_GAME_CONSTANTS } from '@common/game-constants';
import { of } from 'rxjs';

import { GameConstantsComponent } from './game-constants.component';

describe('GameConstantsComponent', () => {
    let component: GameConstantsComponent;
    let fixture: ComponentFixture<GameConstantsComponent>;
    let gameConstantsService: GameConstantsService;

    beforeEach(async () => {
        gameConstantsService = jasmine.createSpyObj('GameConstantsService', ['getGameConstants', 'updateGameConstants']);
        gameConstantsService.getGameConstants = () => {
            return of(DEFAULT_GAME_CONSTANTS);
        };
        gameConstantsService.updateGameConstants = () => {
            return of();
        };

        await TestBed.configureTestingModule({
            declarations: [GameConstantsComponent],
            imports: [HttpClientTestingModule, FormsModule],
            providers: [{ provide: GameConstantsService, useValue: gameConstantsService }],
        }).compileComponents();

        fixture = TestBed.createComponent(GameConstantsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('it should set the game constants on ngOnInit', () => {
        spyOn(gameConstantsService, 'getGameConstants').and.returnValue(of(DEFAULT_GAME_CONSTANTS));

        fixture.detectChanges();

        expect(component.gameConstants).toEqual(DEFAULT_GAME_CONSTANTS);
    });

    it('updateGameConstants() should call updateGameConstants from the service', () => {
        spyOn(gameConstantsService, 'updateGameConstants').and.returnValue(of(undefined));

        component.gameConstants = DEFAULT_GAME_CONSTANTS;
        component.updateGameConstants();

        expect(gameConstantsService.updateGameConstants).toHaveBeenCalledWith(DEFAULT_GAME_CONSTANTS);
    });

    it('resetGameConstants() should reset gameConstants call updateGameConstants ', () => {
        component.gameConstants = {
            countDown: -0,
            hint: -0,
            difference: -0,
        };
        component.resetGameConstants();

        expect(component.gameConstants).toEqual(DEFAULT_GAME_CONSTANTS);
        expect(component.updateGameConstants).toHaveBeenCalled();
    });

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
