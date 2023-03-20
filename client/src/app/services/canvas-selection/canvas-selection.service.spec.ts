import { TestBed } from '@angular/core/testing';

import { CanvasSelectionService } from './canvas-selection.service';

describe('CanvasSelectionService', () => {
  let service: CanvasSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CanvasSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
