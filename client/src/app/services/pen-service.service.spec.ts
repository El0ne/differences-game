import { TestBed } from '@angular/core/testing';
import { PenService } from './pen-service.service';

describe('PenServiceService', () => {
    let service: PenService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PenService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
