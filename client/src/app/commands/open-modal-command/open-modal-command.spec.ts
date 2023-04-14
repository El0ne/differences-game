import { OpenModalCommand } from '@app/commands/open-modal-command/open-modal-command';
import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';

describe('OpenInfoModalCommand', () => {
    let command: OpenModalCommand;
    let soloView: jasmine.SpyObj<SoloViewComponent>;

    beforeEach(() => {
        soloView = jasmine.createSpyObj<SoloViewComponent>('SoloViewComponent', ['openInfoModal']);
        // command = new OpenModalCommand(soloView);
    });

    it('should call method to open information modal ', () => {
        command.isInfoModal = true;
        command.execute();
        expect(soloView.openInfoModal).toHaveBeenCalled();
    });

    it('should call method to quit game', () => {
        command.isInfoModal = false;
        command.execute();
        expect(soloView.quitGame).toHaveBeenCalled();
    });
});
