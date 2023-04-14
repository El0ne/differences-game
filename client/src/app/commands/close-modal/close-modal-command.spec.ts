import { CloseModalCommand } from '@app/commands/close-modal/close-modal-command';
import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';

describe('CloseInfoModalCommand', () => {
    let command: CloseModalCommand;
    let soloView: jasmine.SpyObj<SoloViewComponent>;

    beforeEach(() => {
        soloView = jasmine.createSpyObj('SoloViewComponent', ['closeInfoModal']);
        command = new CloseModalCommand(soloView);
    });

    it('should call close info modal method', () => {
        command.execute(); // Execute the command
        expect(soloView.closeModals).toHaveBeenCalled();
    });
});
