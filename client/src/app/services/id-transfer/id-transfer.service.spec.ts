import { TestBed } from '@angular/core/testing';

import { IdTransferService } from './id-transfer.service';

describe('IdTransferServiceService', () => {
    let service: IdTransferService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(IdTransferService);

        service.idToTransfer = '5';
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set it given a certain id ', () => {
        service.setIdFromGameCard('3');
        expect(service.idToTransfer).toEqual('3');
    });

    it('should return the id value set inside the service', () => {
        const expected = service.getId();
        expect(expected).toEqual('5');
    });
});
