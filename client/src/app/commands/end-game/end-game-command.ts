import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';

export class EndGameCommand {
    soloView: SoloViewComponent;
    constructor(soloView: SoloViewComponent) {
        this.soloView = soloView;
    }
    execute(): void {
        this.soloView.openReplayModal();
    }
}
