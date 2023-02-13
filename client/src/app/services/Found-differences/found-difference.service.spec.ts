import { TestBed } from '@angular/core/testing';

import { FoundDifferenceService } from './found-difference.service';

describe('FoundDifferenceService', () => {
  let service: FoundDifferenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoundDifferenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
