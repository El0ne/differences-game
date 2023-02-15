/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ClickEventService } from '@app/services/click-event/click-event.service';
import { CLICK } from '@app/services/server-routes';

describe('ClickEventService', () => {
    let service: ClickEventService;
    let httpController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
        service = TestBed.inject(ClickEventService);
        httpController = TestBed.inject(HttpTestingController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getDifferences() should return a empty array if no games are found', () => {
        service.getDifferences('0').subscribe((res) => {
            expect(res).toEqual([]);
        });

        const req = httpController.expectOne(`${CLICK}/0`);
        req.flush([]);
    });

    it('getDifferences() should return a number[][] with differences if the game is found', () => {
        const testDifferences = [
            [1, 2, 3],
            [4, 5, 6],
        ];
        service.getDifferences('2').subscribe((res) => {
            expect(typeof res).toEqual(typeof testDifferences);
            expect(res).toEqual(testDifferences);
        });
        const req = httpController.expectOne(`${CLICK}/2`);
        req.flush(testDifferences);
    });

    it('getDifferences() should call get', () => {
        const getSpy = spyOn(service.http, 'get');

        service.getDifferences('0');
        expect(getSpy).toHaveBeenCalled();
    });

    it('isADifference should return a ClickDifferenceVerification', () => {
        const test = {
            isADifference: true,
            differenceArray: [1, 2, 3],
            differencesPosition: 2,
        };
        service.isADifference(0, 0, '1').subscribe((res) => {
            expect(typeof res).toEqual(typeof test);
            expect(res).toEqual(test);
        });

        const req = httpController.expectOne(`${CLICK}?x=0&y=0&id=1`);
        req.flush(test);
    });

    it('isADifference() should call get', () => {
        const getSpy = spyOn(service.http, 'get');

        service.isADifference(1, 1, '0');
        expect(getSpy).toHaveBeenCalled();
    });
});
