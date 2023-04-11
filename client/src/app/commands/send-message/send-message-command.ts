import { Command } from '@app/commands/command';
import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';

export class SendMessageCommand implements Command {
    soloView: SoloViewComponent;
    constructor(soloView: SoloViewComponent) {
        this.soloView = soloView;
    }

    execute(): void {
        this.soloView.sendMessage();
        console.log('send message');
        console.log(' \n');
    }
}
