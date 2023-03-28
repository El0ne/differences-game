import { TestBed } from '@angular/core/testing';

import { ReplayGameService } from './replay-game.service';

describe('ReplayGameService', () => {
  let service: ReplayGameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReplayGameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
