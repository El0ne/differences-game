import { Command } from '@app/commands/command';
import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';

export class ThirdHintColorCommand implements Command {
    soloView: SoloViewComponent;
    color: string;

    constructor(soloView: SoloViewComponent, color: string) {
        this.soloView = soloView;
        this.color = color;
    }

    execute(): void {
        this.soloView.hintColor = this.color;
    }
}
