import { CloseModalCommand } from '@app/commands/close-modal/close-modal-command';
import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';

describe('CloseModalCommand', () => {
    let command: CloseModalCommand;
    let soloView: SoloViewComponent;

    beforeEach(() => {
        soloView = jasmine.createSpyObj('SoloViewComponent', ['closeModals']);
        command = new CloseModalCommand(soloView);
    });

    it('should create an instance', () => {
        expect(command).toBeTruthy();
    });

    it('should execute closeModals on the SoloViewComponent', () => {
        command.execute();
        expect(soloView.closeModals).toHaveBeenCalled();
    });
});
