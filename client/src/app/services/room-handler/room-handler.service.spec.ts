import { TestBed } from '@angular/core/testing';

import { RoomHandlerService } from './room-handler.service';

describe('RoomHandlerService', () => {
  let service: RoomHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoomHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
