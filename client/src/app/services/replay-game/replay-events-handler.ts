/* eslint-disable max-classes-per-file */

import { ClickEventComponent } from '@app/components/click-event/click-event.component';
import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';

/* eslint-disable max-classes-per-file */

export interface Command {
    execute(): void;
}

export class ClickCommand implements Command {
    clickEvent: ClickEventComponent;
    private x: number;
    private y: number;

    constructor(clickEvent: ClickEventComponent, x: number, y: number) {
        this.x = x;
        this.y = y;
        this.clickEvent = clickEvent;
    }

    execute(): void {
        const event = new MouseEvent('click', {
            clientX: this.x,
            clientY: this.y,
        });
        // document.dispatchEvent(event);
        this.clickEvent.isDifferent(event);
        console.log('click : ', 'x :', this.x, 'y :', this.y, '\n');
    }
}

export class WriteMessageCommand implements Command {
    private currentMessage: string;
    private input: HTMLInputElement;

    constructor(input: HTMLInputElement, currentMessage: string) {
        this.input = input;
        this.currentMessage = currentMessage;
    }

    execute(): void {
        this.input.value = this.currentMessage;
        this.input.dispatchEvent(new Event('input'));
        console.log('write message : ', this.currentMessage);
        console.log(' \n');
    }
}

export class SendMessageCommand implements Command {
    soloview: SoloViewComponent;
    constructor(soloView: SoloViewComponent) {
        this.soloview = soloView;
    }

    execute(): void {
        this.soloview.sendMessage();
        console.log('send message');
        console.log(' \n');
    }
}

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
