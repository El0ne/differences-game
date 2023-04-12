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
        // this.clickEvent.isDifferent(event);
        // TODO: create function to replicate a click event without getting server info
        this.clickEvent.differenceData = this.data;
        if (
            this.clickEvent.differenceData.isADifference &&
            !this.clickEvent.foundDifferenceService.foundDifferences.includes(this.clickEvent.differenceData.differencesPosition)
        ) {
            this.clickEvent.differenceDetected.emit({
                differencesPosition: this.clickEvent.differenceData.differencesPosition,
                lastDifferences: this.clickEvent.differenceData.differenceArray,
            });
            if (this.clickEvent.toggleCheatMode) {
                const keyEvent: KeyboardEvent = new KeyboardEvent('keydown', { key: 't' });
                this.clickEvent.cheatModeHandler.emit(keyEvent);
            }
        } else {
            this.clickEvent.displayError(this.mouseEvent);
        }
    }
}
