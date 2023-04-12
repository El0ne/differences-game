import { TestBed } from '@angular/core/testing';

import { ReplayButtonsService } from './replay-buttons.service';

describe('ReplayButtonsService', () => {
  let service: ReplayButtonsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReplayButtonsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
