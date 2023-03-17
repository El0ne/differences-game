import { TestBed } from '@angular/core/testing';
import { EraserButtonService } from './eraser-button.service';

describe('EraserButtonService', () => {
    let service: EraserButtonService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(EraserButtonService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
