/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { GameHintService } from './game-hint.service';

describe('GameHintService', () => {
    let service: GameHintService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameHintService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getPercentages should return the proper percentage if hintsRemaining equals 3', () => {
        service.hintsRemaining = 3;

        const positions = [241, 321];
        const percentages = service.getPercentages(positions);
        expect(percentages).toEqual([0, 0.5]);
    });

    it('getPercentages should return the proper percentage if hintsRemaining equals 3', () => {
        service.hintsRemaining = 3;

        const positions = [239, 319];
        const percentages = service.getPercentages(positions);
        expect(percentages).toEqual([0, 0.5]);
    });

    it('getPercentages should return the proper percentage if hintsRemaining equals 2', () => {
        service.hintsRemaining = 2;

        const positions = [239, 319];
        const percentages = service.getPercentages(positions);
        expect(percentages).toEqual([0.25, 0.5]);
    });

    it('getPercentages should return the proper percentage if hintsRemaining equals 2', () => {
        service.hintsRemaining = 2;

        const positions = [100, 100];
        const percentages = service.getPercentages(positions);
        expect(percentages).toEqual([0, 0]);
    });

    it('getPercentages should return the proper percentage if hintsRemaining equals 2', () => {
        service.hintsRemaining = 2;

        const positions = [480, 640];
        const percentages = service.getPercentages(positions);
        expect(percentages).toEqual([0.75, 0.75]);
    });
});
