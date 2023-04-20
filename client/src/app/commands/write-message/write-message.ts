import { Command } from '@app/commands/command';

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
    }
}
