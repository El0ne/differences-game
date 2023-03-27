import { TestBed } from '@angular/core/testing';

import { BestTimeService } from './best-time.service';

describe('BestTimeService', () => {
  let service: BestTimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BestTimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
