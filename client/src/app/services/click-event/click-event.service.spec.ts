import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ClickEventService } from '@app/services/click-event/click-event.service';

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

    /*
    it('should make a GET request to the correct URL with the correct parameters', () => {
        service.isADifference(0, 0, '').subscribe((res) => {
            expect(res).toBeTruthy();
        });
    });
    */
});
