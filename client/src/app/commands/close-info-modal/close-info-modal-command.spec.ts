import { CloseInfoModalCommand } from '@app/commands/close-info-modal/close-info-modal-command';
import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';

describe('CloseInfoModalCommand', () => {
    let command: CloseInfoModalCommand;
    let soloView: jasmine.SpyObj<SoloViewComponent>;

    beforeEach(() => {
        soloView = jasmine.createSpyObj('SoloViewComponent', ['closeInfoModal']);
        command = new CloseInfoModalCommand(soloView);
    });

    it('should call close info modal method', () => {
        command.execute(); // Execute the command
        expect(soloView.closeInfoModal).toHaveBeenCalled();
    });
});
