import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';
import { ThirdHintColorCommand } from './third-hint-color-command';

describe('ThirdHintColorCommand', () => {
    let soloView: SoloViewComponent;
    let command: ThirdHintColorCommand;

    beforeEach(() => {
        soloView = jasmine.createSpyObj('SoloViewComponent', ['']);
        command = new ThirdHintColorCommand(soloView, 'blue');
    });

    it('should create an instance', () => {
        expect(command).toBeTruthy();
    });

    it('should execute the command', () => {
        command.execute();
        expect(soloView.hintColor).toEqual('blue');
    });
});
