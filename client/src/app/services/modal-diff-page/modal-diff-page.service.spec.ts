import { TestBed } from '@angular/core/testing';

import { ModalDiffPageService } from './modal-diff-page.service';

describe('ModalDiffPageService', () => {
    let service: ModalDiffPageService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ModalDiffPageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
