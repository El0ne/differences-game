import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';
import { PlayerDifference } from '@common/difference-information';

export class OpponentDifferenceCommand {
    playerDifference: PlayerDifference;
    soloView: SoloViewComponent;
    constructor(soloView: SoloViewComponent, playerDifference: PlayerDifference) {
        this.playerDifference = playerDifference;
        this.soloView = soloView;
    }

    execute(): void {
        this.soloView.effectHandler(this.playerDifference);
    }
}
