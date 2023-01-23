import { TestBed } from '@angular/core/testing';
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
        const SEVENTY_FIVE_SECONDS = 75;
        expect(service.convert(SEVENTY_FIVE_SECONDS)).toEqual('1:15');
    });

    it('should be 1 minute if there is  60 seconds', () => {
        const SIXTY_SECONDS = 60;
        expect(service.convert(SIXTY_SECONDS)).toEqual('1:00');
    });

    it('should be 0 minute if there is less than 60 seconds', () => {
        const TWENTY_SECONDS = 20;
        expect(service.convert(TWENTY_SECONDS)).toEqual('0:20');
    });

    it('should have two digits even if we have less than 10 seconds', () => {
        const TWENTY_SECONDS = 67;
        expect(service.convert(TWENTY_SECONDS)).toEqual('1:07');
    });
});
