import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GAME_HISTORY } from '@app/services/server-routes';
import { FAKE_GAME_HISTORY, FAKE_GAME_HISTORY_SINGLE } from '@common/mock/game-history-mock';
import { GameHistoryService } from './game-history.service';

describe('GameHistoryService', () => {
    let service: GameHistoryService;
    let httpController: HttpTestingController;
    // let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(GameHistoryService);
        httpController = TestBed.inject(HttpTestingController);
        // httpMock = TestBed.inject(HttpTestingController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getGameHistory() should return all the game history', () => {
        service.getGameHistory().subscribe((res) => {
            expect(res).toEqual(FAKE_GAME_HISTORY);
        });

        const req = httpController.expectOne(GAME_HISTORY);
        expect(req.request.method).toBe('GET');
        req.flush(FAKE_GAME_HISTORY);
    });

    it('deleteGameHistory should call delete on httpManager', () => {
        // const deleteSpy = spyOn(httpMock, 'delete');

        // service.deleteGameHistory();
        // expect(deleteSpy).toHaveBeenCalled();
        service.deleteGameHistory().subscribe((res) => {
            expect(res).toEqual(FAKE_GAME_HISTORY);
        });

        const req = httpController.expectOne(GAME_HISTORY);
        expect(req.request.method).toBe('DELETE');
        req.flush(FAKE_GAME_HISTORY);
    });

    it('addGameHistory() should return all the game history', () => {
        service.addGameHistory(FAKE_GAME_HISTORY_SINGLE).subscribe((res) => {
            expect(res).toEqual(FAKE_GAME_HISTORY_SINGLE);
        });

        const req = httpController.expectOne(GAME_HISTORY);
        expect(req.request.method).toBe('POST');
        req.flush(FAKE_GAME_HISTORY_SINGLE);
    });
});
