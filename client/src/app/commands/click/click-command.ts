import { Command } from '@app/commands/command';
import { ClickEventComponent } from '@app/components/click-event/click-event.component';
import { ClickDifferenceVerification } from '@common/click-difference-verification';

export class ClickCommand implements Command {
    clickEvent: ClickEventComponent;
    private data: ClickDifferenceVerification;
    private mouseEvent: MouseEvent;

    constructor(clickEvent: ClickEventComponent, data: ClickDifferenceVerification, mouseEvent: MouseEvent) {
        this.data = data;
        this.clickEvent = clickEvent;
        this.mouseEvent = mouseEvent;
    }

    execute(): void {
        console.log('click command');
        this.clickEvent.emitToSoloView(this.data, this.mouseEvent);
    }
}
