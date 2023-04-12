import { OpenInfoModalCommand } from '@app/commands/open-info-modal-command/open-info-modal-command';
import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';

describe('OpenInfoModalCommand', () => {
    let command: OpenInfoModalCommand;
    let soloView: jasmine.SpyObj<SoloViewComponent>;

    beforeEach(() => {
        soloView = jasmine.createSpyObj<SoloViewComponent>('SoloViewComponent', ['openInfoModal']);
        command = new OpenInfoModalCommand(soloView);
    });

    it('should call method to open information modal ', () => {
        command.execute();
        expect(soloView.openInfoModal).toHaveBeenCalled();
    });
});
