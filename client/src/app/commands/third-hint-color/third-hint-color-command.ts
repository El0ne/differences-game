import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';

export class ThirdHintColorCommand {
    soloView: SoloViewComponent;
    // clickPosition: number[];
    // hintPosition: number;
    color: string;

    constructor(soloView: SoloViewComponent, color: string) {
        this.soloView = soloView;
        // this.clickPosition = clickPosition;
        // this.hintPosition = hintPosition;
        this.color = color;
    }

    execute(): void {
        // this.soloView.left.currentPixelHint = this.hintPosition;
        // this.soloView.setColor(this.clickPosition);

        this.soloView.hintColor = this.color;
    }
}
