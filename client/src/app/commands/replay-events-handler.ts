/* eslint-disable max-classes-per-file */

import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';
import { Command } from './command';

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

export class ModalCloseCommand implements Command {
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

export class Invoker {
    commands = new Array();

    addCommand(command: Command, time: number): void {
        this.commands.push({ action: command, time });

        console.log(this.commands);
    }
}
