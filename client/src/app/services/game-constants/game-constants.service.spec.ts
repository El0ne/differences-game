import { TestBed } from '@angular/core/testing';

import { GameConstantsService } from './game-constants.service';

describe('GameConstantsService', () => {
  let service: GameConstantsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameConstantsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
