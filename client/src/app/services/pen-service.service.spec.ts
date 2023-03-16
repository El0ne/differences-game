import { TestBed } from '@angular/core/testing';

import { PenServiceService } from './pen-service.service';

describe('PenServiceService', () => {
  let service: PenServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PenServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
