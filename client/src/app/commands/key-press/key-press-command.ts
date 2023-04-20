import { Command } from '@app/commands/command';
import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';

export class KeyPressCommand implements Command {
    private event: KeyboardEvent;
    private soloView: SoloViewComponent;

    constructor(event: KeyboardEvent, soloView: SoloViewComponent) {
        this.event = event;
        this.soloView = soloView;
    }

    execute(): void {
        if (this.event.key === 't') {
            this.soloView.activateCheatMode(this.event);
        }
    }
}
