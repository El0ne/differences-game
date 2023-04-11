import { Command } from '@app/commands/command';
import { ClickEventComponent } from '@app/components/click-event/click-event.component';

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
