/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { BestTimeComponent } from '@app/components/best-time/best-time.component';
import { GameCardSelectionComponent } from '@app/components/game-card-selection/game-card-selection.component';
import { GAMES } from '@app/mock/game-cards';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { SocketService } from '@app/services/socket/socket.service';
import { GameCardInformation } from '@common/game-card';
import { WAITING_ROOM_EVENTS } from '@common/waiting-room-socket-communication';
import { Subject, of } from 'rxjs';
import { GAME_CARDS_TO_DISPLAY } from './game-selection-constants';
import { DELAY_BEFORE_REFRESH, GameSelectionComponent } from './game-selection.component';

describe('GameSelectionComponent', () => {
    let component: GameSelectionComponent;
    let fixture: ComponentFixture<GameSelectionComponent>;
    let gameCardInfoService: GameCardInformationService;
    let testGameCardsInformation: Subject<GameCardInformation[]>;
    let socketServiceSpy: SocketService;

    beforeEach(() => {
        gameCardInfoService = jasmine.createSpyObj('GameCardInformationService', ['getGameCardsInformation', 'getNumberOfGameCardInformation']);
        gameCardInfoService.getNumberOfGameCardInformation = () => {
            return of(GAME_CARDS_TO_DISPLAY);
        };

        testGameCardsInformation = new Subject<GameCardInformation[]>();
        gameCardInfoService.getGameCardsInformations = () => {
            testGameCardsInformation.next(GAMES.slice(0, GAME_CARDS_TO_DISPLAY));
            return testGameCardsInformation.asObservable();
        };

        socketServiceSpy = jasmine.createSpyObj('SocketService', ['names', 'listen', 'delete', 'send', 'connect'], ['socketId']);

        TestBed.configureTestingModule({
            declarations: [GameSelectionComponent, GameCardSelectionComponent, BestTimeComponent],
            imports: [RouterTestingModule, MatIconModule, MatDialogModule, HttpClientTestingModule],
            providers: [
                { provide: GameCardInformationService, useValue: gameCardInfoService },
                { provide: SocketService, useValue: socketServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameSelectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('isConfig should be true if the route is /config', () => {
        spyOnProperty(component['router'], 'url', 'get').and.returnValue('/config');
        component.ngOnInit();
        expect(component.isConfig).toBeTruthy();
    });

    it('isConfig should be false if the route is /select-stage', () => {
        spyOnProperty(component['router'], 'url', 'get').and.returnValue('/select-stage');
        component.ngOnInit();
        expect(component.isConfig).toBeFalsy();
    });

    it('selectGameCards() should put the end Index at 3 more than index unless there is less than 4 other gameCards to show', () => {
        spyOn(component['gameCardService'], 'getGameCardsInformations').and.returnValue(of(GAMES));
        component.index = 0;
        component.numberOfGameInformations = 5;
        component.selectGameCards();
        expect(component['gameCardService'].getGameCardsInformations).toHaveBeenCalledWith(
            component.index,
            component.index + GAME_CARDS_TO_DISPLAY - 1,
        );

        component.index = 3;
        component.numberOfGameInformations = 5;
        component.selectGameCards();
        expect(component['gameCardService'].getGameCardsInformations).toHaveBeenCalledWith(component.index, component.numberOfGameInformations - 1);
    });

    it('previousCards() should not call selectGameCards() if index is 0', () => {
        component.selectGameCards = jasmine.createSpy();
        component.previousCards();
        expect(component.selectGameCards).not.toHaveBeenCalled();
    });

    it('previousCards() should call selectGameCards() if index is different than 0', () => {
        component.index = 4;
        component.selectGameCards = jasmine.createSpy();
        component.previousCards();
        expect(component.selectGameCards).toHaveBeenCalled();
    });

    it('nextCards() should not call selectGameCards() if current index plus 4 is greater than or equal to numberOfGameInformations', () => {
        component.index = 4;
        component.numberOfGameInformations = component.index + 1;
        component.selectGameCards = jasmine.createSpy();
        component.nextCards();
        expect(component.selectGameCards).not.toHaveBeenCalled();
    });

    it('nextCards() should call selectGameCards() if current index plus 4 is less than than numberOfGameInformations', () => {
        component.index = 4;
        component.numberOfGameInformations = component.index + GAME_CARDS_TO_DISPLAY + 1;
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

    it('isShowingLastCard() should return false unless index plus 4 is greater or equal than numberOfGameInformations', () => {
        component.numberOfGameInformations = 10;
        component.index = 4;
        expect(component.isShowingLastCard()).toBeFalsy();
        component.index = component.numberOfGameInformations;
        expect(component.isShowingLastCard()).toBeTruthy();
    });

    it('refreshGameCards() should call getNumberOfGameCardInformation and getGameCardsInformations', fakeAsync(() => {
        const fakeData = 5;
        spyOn(component['gameCardService'], 'getNumberOfGameCardInformation').and.returnValue(of(fakeData));
        spyOn(component, 'selectGameCards');
        component.refreshGameCards();
        tick(DELAY_BEFORE_REFRESH);
        expect(component.numberOfGameInformations).toEqual(fakeData);
        expect(component['gameCardService'].getNumberOfGameCardInformation).toHaveBeenCalled();
        expect(component.selectGameCards).toHaveBeenCalled();
    }));

    it('MatchCreated event should call setGameCardCreateOrJoin with isCreate at false', () => {
        socketServiceSpy.listen = (event: string, callback: any) => {
            if (event === WAITING_ROOM_EVENTS.MatchCreated) callback('stageId');
        };
        spyOn(component, 'setGameCardCreateOrJoin').and.returnValue();
        component.ngOnInit();
        expect(component.setGameCardCreateOrJoin).toHaveBeenCalledWith(false, 'stageId');
    });

    it('gameDeleted event should call refreshGameCards', () => {
        socketServiceSpy.listen = (event: string, callback: any) => {
            if (event === WAITING_ROOM_EVENTS.GameDeleted) callback();
        };
        spyOn(component, 'refreshGameCards').and.returnValue();
        component.ngOnInit();
        expect(component.refreshGameCards).toHaveBeenCalled();
    });

    it('MatchDeleted event should call setGameCardCreateOrJoin with isCreate at true', () => {
        socketServiceSpy.listen = (event: string, callback: any) => {
            if (event === WAITING_ROOM_EVENTS.MatchDeleted) callback('stageId');
        };
        spyOn(component, 'setGameCardCreateOrJoin').and.returnValue();
        component.ngOnInit();
        expect(component.setGameCardCreateOrJoin).toHaveBeenCalledWith(true, 'stageId');
    });

    it('setGameCardCreateOrJoin should find the right gameCard to change his createGame button', () => {
        component.gameCardInformations = GAMES;
        fixture.detectChanges();
        component.setGameCardCreateOrJoin(false, '123');
        expect(component.stages.get(0)?.createGameButton).toBeFalsy();
    });

    it('selectGameCards() should put the end Index at 3 more than index unless there is less than 4 other gameCards to show', () => {
        spyOn(component['gameCardService'], 'getGameCardsInformations').and.returnValue(of(GAMES.slice(0, 1)));
        component.index = 0;
        component.numberOfGameInformations = 5;
        component.selectGameCards();
        expect(socketServiceSpy.send).toHaveBeenCalledWith(WAITING_ROOM_EVENTS.ScanForHost, ['123']);
    });

    it('refreshGameCards() should call selectGameCards() and getGameCardsInformations()', fakeAsync(() => {
        spyOn(component, 'selectGameCards').and.returnValue();
        spyOn(gameCardInfoService, 'getNumberOfGameCardInformation').and.returnValue(of(GAME_CARDS_TO_DISPLAY));

        component.refreshGameCards();
        tick(DELAY_BEFORE_REFRESH * 3);

        expect(gameCardInfoService.getNumberOfGameCardInformation).toHaveBeenCalled();
        expect(component.numberOfGameInformations).toEqual(GAME_CARDS_TO_DISPLAY);
        expect(component.selectGameCards).toHaveBeenCalled();
    }));
});
