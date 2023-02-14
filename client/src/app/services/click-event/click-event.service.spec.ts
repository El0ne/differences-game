import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ClickEventService } from '@app/services/click-event/click-event.service';

describe('ClickEventService', () => {
    let service: ClickEventService;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
        service = TestBed.inject(ClickEventService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
