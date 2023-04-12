import { Command } from '@app/commands/command';
import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';

export class CloseInfoModalCommand implements Command {
    soloView: SoloViewComponent;

    constructor(soloView: SoloViewComponent) {
        this.soloView = soloView;
    }
    execute(): void {
        this.soloView.closeInfoModal();
    }
}
