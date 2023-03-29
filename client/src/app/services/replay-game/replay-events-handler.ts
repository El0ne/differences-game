/* eslint-disable max-classes-per-file */

/* eslint-disable max-classes-per-file */
export interface Command {
    execute(): void;
}

export class ClickCommand implements Command {
    private x: number;
    private y: number;

    setCoordinates(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    execute(): void {
        const event = new MouseEvent('click', {
            clientX: this.x,
            clientY: this.y,
        });
        document.dispatchEvent(event);
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
    }
}

export class SendMessageCommand implements Command {
    execute(): void {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    }
}
export class CheatModeCommand implements Command {
    execute(): void {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 't' }));
    }
}

export class ClueCommand implements Command {
    execute(): void {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'i' }));
    }
}

export class Invoker {
    private commands = new Array();
    private time: number;

    addCommand(command: Command, time: number): void {
        this.commands.push({ action: command, time });

        console.log(this.commands);
    }

    getTimer(time: number): number {
        this.time = time;
        return this.time;
    }

    run(): void {
        this.commands.forEach((command) => {
            setTimeout(() => {
                if (command.time === this.time) {
                    command.action.execute();
                }
            });
        });
    }
}
