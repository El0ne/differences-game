import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { GameCardInformationService } from './game-card-information.service';

describe('GameCardInformationService', () => {
    let service: GameCardInformationService;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
        service = TestBed.inject(GameCardInformationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
