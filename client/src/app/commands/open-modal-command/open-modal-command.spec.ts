import { OpenModalCommand } from '@app/commands/open-modal-command/open-modal-command';
import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';

describe('OpenModalCommand', () => {
    let command: OpenModalCommand;
    let soloView: SoloViewComponent;

    beforeEach(() => {
        soloView = jasmine.createSpyObj('SoloViewComponent', ['openInfoModal', 'quitGame']);
    });

    it('should create an instance with isInfoModal = true', () => {
        command = new OpenModalCommand(soloView, true);
        expect(command).toBeTruthy();
    });

    it('should execute openInfoModal on the SoloViewComponent with isInfoModal = true', () => {
        command = new OpenModalCommand(soloView, true);
        command.execute();
        expect(soloView.openInfoModal).toHaveBeenCalled();
    });

    it('should create an instance with isInfoModal = false', () => {
        command = new OpenModalCommand(soloView, false);
        expect(command).toBeTruthy();
    });

    it('should execute quitGame on the SoloViewComponent with isInfoModal = false', () => {
        command = new OpenModalCommand(soloView, false);
        command.execute();
        expect(soloView.quitGame).toHaveBeenCalled();
    });
});
