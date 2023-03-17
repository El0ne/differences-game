import { TestBed } from '@angular/core/testing';

import { DrawingRectangleService } from './drawing-rectangle.service';

describe('DrawingRectangleService', () => {
  let service: DrawingRectangleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DrawingRectangleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
