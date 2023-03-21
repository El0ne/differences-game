import { Component, Input } from '@angular/core';
import { TimerSoloService } from '@app/services/timer-solo/timer-solo.service';
import { RankingBoard } from '@common/ranking-board';

@Component({
    selector: 'app-best-time',
    templateUrl: './best-time.component.html',
    styleUrls: ['./best-time.component.scss'],
    providers: [TimerSoloService],
})
export class BestTimeComponent {
    @Input() rankingBoard: RankingBoard[];

    constructor(private service: TimerSoloService) {}

    timesConverted(time: number): string {
        return this.service.convert(time);
    }
}
