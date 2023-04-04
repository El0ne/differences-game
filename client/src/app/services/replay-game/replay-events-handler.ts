/* eslint-disable max-classes-per-file */

import { MatDialogRef } from '@angular/material/dialog';
import { GameInfoModalComponent } from '@app/modals/game-info-modal/game-info-modal.component';

/* eslint-disable max-classes-per-file */
export interface Command {
    execute(): void;
}

export class ClickCommand implements Command {
    private x: number;
    private y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    execute(): void {
        // const event = new MouseEvent('click', {
        //     clientX: this.x,
        //     clientY: this.y,
        // });
        // document.dispatchEvent(event);
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
        // this.input.dispatchEvent(new Event('input'));
        console.log('write message : ', this.currentMessage);
        console.log(' \n');
    }
}

export class SendMessageCommand implements Command {
    execute(): void {
        // window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        console.log('send message');
        console.log(' \n');
    }
}
export class CheatModeCommand implements Command {
    execute(): void {
        // window.dispatchEvent(new KeyboardEvent('keydown', { key: 't' }));
        console.log('cheat mode');
        console.log(' \n');
    }
}

export class ClueCommand implements Command {
    execute(): void {
        // window.dispatchEvent(new KeyboardEvent('keydown', { key: 'i' }));
        console.log('clue');
        console.log(' \n');
    }
}

export class ButtonPressCommand implements Command {
    private button: HTMLButtonElement;

    constructor(button: HTMLButtonElement) {
        this.button = button;
    }

    execute(): void {
        // this.button.click();
        console.log('click button : ', this.button);
        console.log(' \n');
    }
}

export class ModalCloseCommand implements Command {
    private modal: MatDialogRef<GameInfoModalComponent>;

    constructor(modal: MatDialogRef<GameInfoModalComponent>) {
        this.modal = modal;
    }

    execute(): void {
        // this.modal.close();
        console.log('close modal : ', this.modal);
        console.log(' \n');
    }
}

export class Invoker {
    commands = new Array();

    addCommand(command: Command, time: number): void {
        this.commands.push({ action: command, time });

        console.log(this.commands);
    }

    // run(time: number): void {
    //     this.commands.forEach((command) => {
    //         console.log(command);
    //         setTimeout(() => {
    //             if (command.time === time) {
    //                 command.action.execute();
    //             }
    //         }, 1000);
    //     });
    // }
}
