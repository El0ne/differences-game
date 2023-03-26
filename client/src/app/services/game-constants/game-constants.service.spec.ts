/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-restricted-imports */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FAKE_GAME_CONSTANTS } from '@common/mock/game-constants-mock';
import { GAME_CONSTANTS } from '../server-routes';
import { GameConstantsService } from './game-constants.service';

describe('GameConstantsService', () => {
    let service: GameConstantsService;
    let httpController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
        service = TestBed.inject(GameConstantsService);
        httpController = TestBed.inject(HttpTestingController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getGameConstants should call get on httpManager', () => {
        service.getGameConstants().subscribe((gameConstants) => {
            expect(gameConstants).toEqual(FAKE_GAME_CONSTANTS);
        });

        const req = httpController.expectOne(`${GAME_CONSTANTS}`);

        service.getGameConstants();
        req.flush(FAKE_GAME_CONSTANTS);
    });

    it('updateGameConstants should call put on httpManager', () => {
        const newConstants = FAKE_GAME_CONSTANTS;
        newConstants.countDown = 200;
        service.updateGameConstants(newConstants).subscribe(() => {
            expect().nothing();
        });

        const req = httpController.expectOne(`${GAME_CONSTANTS}`);
        expect(req.request.body).toEqual(newConstants);
        req.flush(null);
    });
});
