/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatTableModule } from '@angular/material/table';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { FAKE_GAME_HISTORY } from '@common/mock/game-history-mock';
import { of } from 'rxjs';
import { GameHistoryComponent } from './game-history.component';
describe('GameHistoryComponent', () => {
    let component: GameHistoryComponent;
    let fixture: ComponentFixture<GameHistoryComponent>;
    let gameHistoryService: GameHistoryService;

    beforeEach(async () => {
        gameHistoryService = jasmine.createSpyObj('GameHistoryService', ['getGameHistory']);
        gameHistoryService.getGameHistory = () => {
            return of(FAKE_GAME_HISTORY);
        };
        await TestBed.configureTestingModule({
            declarations: [GameHistoryComponent],
            imports: [HttpClientTestingModule, MatTableModule],
            providers: [{ provide: GameHistoryService, useValue: gameHistoryService }],
        }).compileComponents();

        fixture = TestBed.createComponent(GameHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit should set game history', fakeAsync(() => {
        component.ngOnInit();
        tick(1000);

        expect(component.gameHistory).toEqual(FAKE_GAME_HISTORY);
    }));
});
