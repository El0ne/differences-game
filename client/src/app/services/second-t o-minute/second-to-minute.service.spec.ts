import { TestBed } from '@angular/core/testing';
import { SEVENTY_FIVE_SECONDS, SIXTY_SECONDS, SIXTY_SEVEN_SECONDS, TWENTY_SECONDS } from './second-constants';
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
        expect(service.convert(SEVENTY_FIVE_SECONDS)).toEqual('1:15');
    });

    it('should be 1 minute if there is  60 seconds', () => {
        expect(service.convert(SIXTY_SECONDS)).toEqual('1:00');
    });

    it('should be 0 minute if there is less than 60 seconds', () => {
        expect(service.convert(TWENTY_SECONDS)).toEqual('0:20');
    });

    it('should have two digits even if we have less than 10 seconds', () => {
        expect(service.convert(SIXTY_SEVEN_SECONDS)).toEqual('1:07');
    });
});
