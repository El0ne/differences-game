import { OpponentDifferenceCommand } from '@app/commands/opponent-difference/opponent-difference-command';
import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';
import { PlayerDifference } from '@common/difference-information';

describe('OpponentDifferenceCommand', () => {
    let command: OpponentDifferenceCommand;
    let playerDifference: PlayerDifference;
    let soloView: jasmine.SpyObj<SoloViewComponent>;

    beforeEach(() => {
        playerDifference = {
            differencesPosition: 123,
            lastDifferences: [1, 2, 3],
            socket: 'mock-socket',
        };
        soloView = jasmine.createSpyObj<SoloViewComponent>('SoloViewComponent', ['effectHandler']);
        command = new OpponentDifferenceCommand(soloView, playerDifference);
    });

    it('should call effectHandler ', () => {
        command.execute();
        expect(soloView.effectHandler).toHaveBeenCalledWith(playerDifference);
    });
});
