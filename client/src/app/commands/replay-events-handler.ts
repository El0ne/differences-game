/* eslint-disable max-classes-per-file */

import { Command } from './command';

export class Invoker {
    commands = new Array();

    addCommand(command: Command, time: number): void {
        this.commands.push({ action: command, time });

        console.log(this.commands);
    }
}
