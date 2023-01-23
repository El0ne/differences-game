import { TestBed } from '@angular/core/testing';
import { constants } from './constants';
import { SecondToMinuteService } from './second-to-minute.service';

describe('SecondToMinuteService', () => {
    let service: SecondToMinuteService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SecondToMinuteService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should be over 1 minute if there is more than 60 seconds', () => {
        expect(service.convert(constants.SEVENTY_FIVE_SECONDS)).toEqual('1:15');
    });

    it('should be 1 minute if there is  60 seconds', () => {
        expect(service.convert(constants.SIXTY_SECONDS)).toEqual('1:00');
    });

    it('should be 0 minute if there is less than 60 seconds', () => {
        expect(service.convert(constants.TWENTY_SECONDS)).toEqual('0:20');
    });

    it('should have two digits even if we have less than 10 seconds', () => {
        expect(service.convert(constants.SIXTY_SEVEN_SECONDS)).toEqual('1:07');
    });
});
