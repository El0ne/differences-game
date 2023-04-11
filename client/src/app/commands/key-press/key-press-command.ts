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
        // window.dispatchEvent(new KeyboardEvent('keydown', { key: this.key }));
        if (this.event.key === 't') {
            // this.soloView.addCheatMode();
            this.soloView.activateCheatMode(this.event);
        }
        console.log('key press : ', this.event.key);
        console.log(' \n');
    }
}
