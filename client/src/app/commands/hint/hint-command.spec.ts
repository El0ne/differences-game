import { HintCommand } from '@app/commands/hint/hint-command';
import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';

describe('HintCommand', () => {
    let command: HintCommand;
    let soloView: SoloViewComponent;

    beforeEach(() => {
        soloView = jasmine.createSpyObj('SoloViewComponent', ['setCurrentHint', 'hintTimeouts', 'handleHint', 'activateThirdHint']);
        soloView.left = jasmine.createSpyObj('left', ['hintPosX', 'hintPosY']);
        soloView.right = jasmine.createSpyObj('right', ['hintPosX', 'hintPosY']);
        soloView.gameHintService = jasmine.createSpyObj('gameHintService', ['hintsRemaining']);
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
        soloView.gameHintService.hintsRemaining = 2;
        command = new HintCommand(0, 0, soloView);
        command.execute();
        expect(soloView.gameHintService.hintsRemaining).toBe(1);
    });

    it('should activate third hint on soloView when hintsRemaining is 0', () => {
        soloView.gameHintService.hintsRemaining = 1;
        command = new HintCommand(0, 0, soloView);
        command.execute();
        expect(soloView.activateThirdHint).toHaveBeenCalled();
    });

    it('should call setCurrentHint, hintTimeouts, and handleHint on soloView', () => {
        command = new HintCommand(0, 0, soloView);
        command.execute();
        expect(soloView.setCurrentHint).toHaveBeenCalled();
        expect(soloView.hintTimeouts).toHaveBeenCalled();
        expect(soloView.handleHint).toHaveBeenCalled();
    });
});
