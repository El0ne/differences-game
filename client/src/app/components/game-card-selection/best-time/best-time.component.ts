import { Component, Input } from '@angular/core';
import { RankingBoard } from '@app/Classes/ranking-board';
import { SecondToMinuteService } from '@app/services/second-t o-minute/second-to-minute.service';

@Component({
    selector: 'app-best-time',
    templateUrl: './best-time.component.html',
    styleUrls: ['./best-time.component.scss'],
    providers: [SecondToMinuteService],
})
export class BestTimeComponent {
    @Input() rankingBoard: RankingBoard[];

    constructor(private timeConverter: SecondToMinuteService) {}

    timesConverted(time: number) {
        return this.timeConverter.convert(time);
    }
}
