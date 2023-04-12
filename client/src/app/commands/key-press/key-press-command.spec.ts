import { KeyPressCommand } from '@app/commands/key-press/key-press-command';
import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';

describe('KeyPressCommand', () => {
    let command: KeyPressCommand;
    let event: KeyboardEvent;
    let soloView: jasmine.SpyObj<SoloViewComponent>;

    beforeEach(() => {
        event = new KeyboardEvent('keydown', { key: 't' });
        soloView = jasmine.createSpyObj<SoloViewComponent>('SoloViewComponent', ['activateCheatMode']);
        command = new KeyPressCommand(event, soloView);
    });

    it('should call activateCheatMode method when event key is t', () => {
        command.execute();
        expect(soloView.activateCheatMode).toHaveBeenCalledWith(event);
    });

    it('should not call activateCheatMode method when event key is not t', () => {
        event = new KeyboardEvent('keydown', { key: 'r' });
        command = new KeyPressCommand(event, soloView);
        command.execute();
        expect(soloView.activateCheatMode).not.toHaveBeenCalled();
    });
});
