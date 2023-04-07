import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { IMAGE } from '@app/services/server-routes';
import { ImagesService } from './images.service';

describe('ImagesService', () => {
    let service: ImagesService;
    let httpController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
        service = TestBed.inject(ImagesService);
        httpController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('deleteImageObjects should call delete on httpManager', () => {
        const id = '123';
        service.deleteImageObjects(id).subscribe(() => {
            expect().nothing();
        });

        const req = httpController.expectOne(`${IMAGE}/${id}`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });
});
