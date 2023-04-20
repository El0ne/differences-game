import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';
import { HintCommand } from './hint-command';

describe('HintCommand', () => {
    let command: HintCommand;
    let soloView: SoloViewComponent;

    beforeEach(() => {
        soloView = jasmine.createSpyObj<SoloViewComponent>('SoloViewComponent', [
            'decreaseHintsRemaining',
            'activateThirdHint',
            'setCurrentHint',
            'hintTimeouts',
            'handleHint',
        ]);
        soloView.left = jasmine.createSpyObj('left', ['hintPosX', 'hintPosY']);
        soloView.right = jasmine.createSpyObj('right', ['hintPosX', 'hintPosY']);
        command = new HintCommand(1, 2, soloView);
    });

    it('should execute the hint command', () => {
        command.execute();

        expect(soloView.left.hintPosX).toEqual(1);
        expect(soloView.left.hintPosY).toEqual(2);
        expect(soloView.right.hintPosX).toEqual(1);
        expect(soloView.right.hintPosY).toEqual(2);
    });

    it('should activate the third hint when no hints remaining', () => {
        Object.defineProperty(soloView, 'hintsRemaining', { value: 0 });

        command.execute();

        expect(soloView.activateThirdHint).toHaveBeenCalled();
    });
});
