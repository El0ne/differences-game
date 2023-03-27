import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameHistoryComponent } from '@app/components/game-history/game-history.component';
import { GameCreationPageComponent } from '@app/pages/game-creation-page/game-creation-page.component';
import { GameSelectionComponent } from '@app/pages/game-selection/game-selection.component';
import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: GameHistoryComponent },
    { path: 'creatingGame', component: GameCreationPageComponent },
    { path: 'stage-selection', component: GameSelectionComponent },
    { path: 'config', component: GameSelectionComponent },
    { path: 'solo/:stageId', component: SoloViewComponent },
    { path: 'multiplayer/:stageId', component: SoloViewComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
