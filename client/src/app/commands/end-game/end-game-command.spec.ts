import { EndGameCommand } from '@app/commands/end-game/end-game-command';
import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';

describe('EndGameCommand', () => {
    let command: EndGameCommand;
    let soloView: jasmine.SpyObj<SoloViewComponent>;

    beforeEach(() => {
        soloView = jasmine.createSpyObj<SoloViewComponent>('SoloViewComponent', ['openReplayModal']);
        command = new EndGameCommand(soloView);
    });

    it('should call open replay modal method', () => {
        command.execute();
        expect(soloView.openReplayModal).toHaveBeenCalled();
    });
});
