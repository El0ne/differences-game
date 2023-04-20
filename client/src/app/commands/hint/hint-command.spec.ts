/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HintCommand } from '@app/commands/hint/hint-command';
import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';
import { GameHintService } from '@app/services/game-hint/game-hint.service';

describe('HintCommand', () => {
    let command: HintCommand;
    let soloView: SoloViewComponent;
    let gameHintServiceSpy: jasmine.SpyObj<GameHintService>;

    beforeEach(() => {
        soloView = jasmine.createSpyObj('SoloViewComponent', [
            'setCurrentHint',
            'hintTimeouts',
            'handleHint',
            'activateThirdHint',
            'decreaseHintsRemaining',
            'hintsRemaining',
        ]);

        soloView.left = jasmine.createSpyObj('left', ['hintPosX', 'hintPosY']);
        soloView.right = jasmine.createSpyObj('right', ['hintPosX', 'hintPosY']);
        gameHintServiceSpy = jasmine.createSpyObj('GameHintService', ['hintsRemaining']);
        Object.defineProperty(gameHintServiceSpy, 'hintsRemaining', { value: 3 });
    });

    it('should create an instance of HintCommand', () => {
        command = new HintCommand(0, 0, soloView);
        expect(command).toBeTruthy();
    });

    it('should update hint positions on left and right components', () => {
        command = new HintCommand(10, 20, soloView);
        command.execute();
        expect(soloView.left.hintPosX).toBe(10);
        expect(soloView.left.hintPosY).toBe(20);
        expect(soloView.right.hintPosX).toBe(10);
        expect(soloView.right.hintPosY).toBe(20);
    });

    it('should decrease hintsRemaining on gameHintService', () => {
        command = new HintCommand(0, 0, soloView);
        command.execute();
        expect(soloView.decreaseHintsRemaining).toHaveBeenCalled();
    });

    it('should call setCurrentHint, hintTimeouts, and handleHint on soloView', () => {
        command = new HintCommand(0, 0, soloView);
        command.execute();
        expect(soloView.setCurrentHint).toHaveBeenCalled();
        expect(soloView.hintTimeouts).toHaveBeenCalled();
        expect(soloView.handleHint).toHaveBeenCalled();
    });
});
