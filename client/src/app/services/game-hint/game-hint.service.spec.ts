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

    it('setColor should return the proper color if radius is very big', () => {
        const clickPosition = [480, 640];
        const hintPosition = [0, 640];
        const color = service.setColor(clickPosition, hintPosition);
        expect(color).toEqual('#0042FF');
    });

    it('setColor should return the proper color if radius is big', () => {
        const clickPosition = [480, 640];
        const hintPosition = [231, 640];
        const color = service.setColor(clickPosition, hintPosition);
        expect(color).toEqual('#4575FF');
    });

    it('setColor should return the proper color if radius is fairly big', () => {
        const clickPosition = [480, 640];
        const hintPosition = [281, 640];
        const color = service.setColor(clickPosition, hintPosition);
        expect(color).toEqual('#A5D7FF');
    });

    it('setColor should return the proper color if radius is fairly small', () => {
        const clickPosition = [480, 640];
        const hintPosition = [331, 640];
        const color = service.setColor(clickPosition, hintPosition);
        expect(color).toEqual('#FF8EBC');
    });

    it('setColor should return the proper color if radius is small', () => {
        const clickPosition = [480, 640];
        const hintPosition = [381, 640];
        const color = service.setColor(clickPosition, hintPosition);
        expect(color).toEqual('#FF2D00');
    });

    it('setColor should return the proper color if radius is really small', () => {
        const clickPosition = [480, 640];
        const hintPosition = [431, 640];
        const color = service.setColor(clickPosition, hintPosition);
        expect(color).toEqual('#881901');
    });
});
