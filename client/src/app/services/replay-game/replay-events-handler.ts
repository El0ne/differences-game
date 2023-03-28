/* eslint-disable max-classes-per-file */
export interface Command {
    execute(): void;
}

export class CanvasClickHandler implements Command {
    private x: number;
    private y: number;
    private canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    setCoordinates(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    execute(): void {
        const event = new MouseEvent('click', {
            clientX: this.x,
            clientY: this.y,
        });
        this.canvas.dispatchEvent(event);
    }
}

export class WriteMessageHandler implements Command {
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

export class SendMessageHandler implements Command {
    execute(): void {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    }
}
export class CheatModeHandler implements Command {
    execute(): void {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 't' }));
    }
}

export class ClueHandler implements Command {
    execute(): void {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'i' }));
    }
}

export class Invoker {
    private commands: Command[] = [];

    addCommand(command: Command): void {
        this.commands.push(command);
    }

    run(): void {
        this.commands.forEach((command) => command.execute());
    }
}
