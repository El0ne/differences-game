import { Command } from '@app/commands/command';
import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';

export class OpenInfoModalCommand implements Command {
    soloView: SoloViewComponent;
    // private button: HTMLButtonElement;
    constructor(soloView: SoloViewComponent) {
        this.soloView = soloView;
    }

    // constructor(button: HTMLButtonElement) {
    //     this.button = button;
    // }

    execute(): void {
        console.log(this.soloView);
        this.soloView.openInfoModal();
        // console.log('click button : ', this.button);
        console.log('modal info opened \n');
    }
}
