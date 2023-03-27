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
});
