import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GAMES } from '@app/mock/game-cards';
import { GAME_CARDS_TO_DISPLAY } from '@app/pages/game-selection/game-selection-constants';
import { STAGE } from '@app/services/server-routes';

import { GameCardInformationService } from './game-card-information.service';

describe('GameCardInformationService', () => {
    let service: GameCardInformationService;
    let httpController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
        service = TestBed.inject(GameCardInformationService);
        httpController = TestBed.inject(HttpTestingController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getNumberOfGameCardInformation() should return a number', () => {
        service.getNumberOfGameCardInformation().subscribe((res) => {
            expect(res).toEqual(GAMES.length);
        });

        const req = httpController.expectOne(`${STAGE}/info`);
        req.flush(GAMES.length);
    });

    it('getGameCardsInformations() should return a array of GameCardInformation', () => {
        service.getGameCardsInformations(0, GAME_CARDS_TO_DISPLAY).subscribe((res) => {
            expect(res).toEqual(GAMES.slice(0, GAME_CARDS_TO_DISPLAY));
        });

        const req = httpController.expectOne(`${STAGE}?index=0&endIndex=4`);
        req.flush(GAMES.slice(0, GAME_CARDS_TO_DISPLAY));
    });

    it('uploadImages should make a GET request', () => {
        const mockString = 'Hello, this is a mock string';
        const mockBlob = new Blob([mockString], { type: 'text/plain' });
        const mockFile = new File([mockBlob], 'mock-file.txt');

        service.uploadImages(mockFile, mockFile, 3).subscribe((res) => {
            expect(res).toBeTruthy();
        });
    });
});
