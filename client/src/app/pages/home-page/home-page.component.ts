import { Component } from '@angular/core';
import { GameOrConfigSelectionService } from '@app/services/game-or-config-selection/game-or-config-selection.service';

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
    constructor(public gameOrConfigService: GameOrConfigSelectionService) {}
}
