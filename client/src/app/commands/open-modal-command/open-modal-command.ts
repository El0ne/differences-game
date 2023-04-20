import { Command } from '@app/commands/command';
import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';

export class OpenModalCommand implements Command {
    soloView: SoloViewComponent;
    isInfoModal: boolean;
    constructor(soloView: SoloViewComponent, isInfoModal: boolean) {
        this.soloView = soloView;
        this.isInfoModal = isInfoModal;
    }

    execute(): void {
        if (this.isInfoModal) {
            this.soloView.openInfoModal();
        } else {
            this.soloView.quitGame();
        }
    }
}
