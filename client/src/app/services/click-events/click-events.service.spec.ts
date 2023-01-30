import { TestBed } from '@angular/core/testing';

import { ClickEventsService } from './click-events.service';

describe('ClickEventsService', () => {
  let service: ClickEventsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClickEventsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
