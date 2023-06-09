import { Command } from '@app/commands/command';
import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';

export class HintCommand implements Command {
    hintPosX: number;
    hintPosY: number;
    soloView: SoloViewComponent;

    constructor(hintPosX: number, hintPosY: number, soloView: SoloViewComponent) {
        this.hintPosX = hintPosX;
        this.hintPosY = hintPosY;
        this.soloView = soloView;
    }

    execute(): void {
        this.soloView.left.hintPosX = this.hintPosX;
        this.soloView.left.hintPosY = this.hintPosY;
        this.soloView.right.hintPosX = this.hintPosX;
        this.soloView.right.hintPosY = this.hintPosY;

        this.soloView.decreaseHintsRemaining();

        if (this.soloView.hintsRemaining === 0) {
            this.soloView.activateThirdHint();
        }
        this.soloView.setCurrentHint();

        this.soloView.hintTimeouts();
        this.soloView.handleHint();
    }
}
