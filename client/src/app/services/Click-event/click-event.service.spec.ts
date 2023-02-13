import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { ClickEventService } from './click-event.service';

describe('ClickEventService', () => {
    let service: ClickEventService;
    // let httpController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
        service = TestBed.inject(ClickEventService);
        // httpController = TestBed.inject(HttpTestingController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('isADifference() should validate a difference depending on the array selected', () => {
        service.isADifference(0, 0).subscribe((res: ClickDifferenceVerification) => {
            expect(res).toBeTrue();
        });

        service.isADifference(100, 2000).subscribe((res: ClickDifferenceVerification) => {
            expect(res).toBeFalse();
        });
    });

    it('setDifference() should return the difference array for the given gameCard id', () => {
        service.setDifferences('4').subscribe((res) => {
            expect(res).toEqual([[]]);
        });
    });
});
