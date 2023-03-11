import { TestBed } from '@angular/core/testing';

import { FileManipulationService } from './file-manipulation.service';

describe('FileManipulationService', () => {
  let service: FileManipulationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileManipulationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
