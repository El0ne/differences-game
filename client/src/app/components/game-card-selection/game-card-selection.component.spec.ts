/* eslint-disable no-underscore-dangle */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { BestTimeComponent } from '@app/components/best-time/best-time.component';
import { GAMES } from '@app/mock/game-cards';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { GameCardInformation } from '@common/game-card';
import { of } from 'rxjs';
import { GameCardSelectionComponent } from './game-card-selection.component';

describe('GameCardSelectionComponent', () => {
    let component: GameCardSelectionComponent;
    let fixture: ComponentFixture<GameCardSelectionComponent>;
    const gameCardServiceSpyObj = jasmine.createSpyObj('GameCardInformationService', ['deleteGame']);
    gameCardServiceSpyObj.deleteGame.and.returnValue(of());
    let gameCardServiceSpy: GameCardInformationService;
    // const gameCardServiceMock = {
    //     deleteGame: jasmine.createSpy().and.returnValue(of(null)),
    // };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCardSelectionComponent, BestTimeComponent],
            imports: [MatIconModule, RouterTestingModule, HttpClientTestingModule],
            providers: [{ provide: GameCardInformationService, useValue: gameCardServiceSpyObj }],
        }).compileComponents();

        fixture = TestBed.createComponent(GameCardSelectionComponent);
        component = fixture.componentInstance;
        gameCardServiceSpy = TestBed.inject(GameCardInformationService) as jasmine.SpyObj<GameCardInformationService>;
        component.gameCardInformation = new GameCardInformation();
        component.gameCardInformation = GAMES[0];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('deleteGame should call gameCardService.deleteGame and gameDeleted.emit', () => {
        component.gameCardInformation = GAMES[0];
        // const gameCardServiceMock = {
        //     deleteGame: jasmine.createSpy().and.returnValue(of()),
        // };
        const gameDeletedSpy = spyOn(component.gameDeleted, 'emit');
        // const gameCardServiceMock = spyOn(gameCardServiceSpy, 'deleteGame').and.returnValue(of());
        component.deleteGame();
        expect(gameCardServiceSpy.deleteGame).toHaveBeenCalledWith(component.gameCardInformation._id);
        expect(gameDeletedSpy).toHaveBeenCalled();
    });
});
