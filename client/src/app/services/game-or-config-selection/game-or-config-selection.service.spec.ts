import { TestBed } from '@angular/core/testing';

import { GameOrConfigSelectionService } from './game-or-config-selection.service';

describe('GameOrConfigSelectionService', () => {
    let service: GameOrConfigSelectionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameOrConfigSelectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set isConfig to true when calling setConfig()', () => {
        service.isConfigView = false;
        service.setConfig();
        expect(service.getConfigView()).toBeTruthy();
    });

    it('should set isConfig to false when calling setGame()', () => {
        service.isConfigView = true;
        service.setGame();
        expect(service.getConfigView()).toBeFalsy();
    });

    it('getConfigView() returns ', () => {
        service.isConfigView = true;
        expect(service.getConfigView()).toBeTruthy();
        service.isConfigView = false;
        expect(service.getConfigView()).toBeFalsy();
    });
});
