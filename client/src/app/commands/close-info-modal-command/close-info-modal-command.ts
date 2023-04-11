import { Command } from '@app/commands/command';
import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';

export class CloseInfoModalCommand implements Command {
    // private modal: MatDialogRef<GameInfoModalComponent>;
    soloView: SoloViewComponent;

    // constructor(modal: MatDialogRef<GameInfoModalComponent>) {
    //     this.modal = modal;
    // }
    constructor(soloView: SoloViewComponent) {
        this.soloView = soloView;
    }
    execute(): void {
        // console.log('in command class : ', this.modal);
        this.soloView.closeInfoModal();
        console.log(' \n');
    }
}
