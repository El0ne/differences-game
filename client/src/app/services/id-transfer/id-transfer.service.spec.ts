import { TestBed } from '@angular/core/testing';

import { IdTransferService } from './id-transfer.service';

describe('IdTransferServiceService', () => {
    let service: IdTransferService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(IdTransferService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
