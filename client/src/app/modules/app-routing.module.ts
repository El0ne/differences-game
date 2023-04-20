import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LimitedTimeComponent } from '@app/modals/limited-time/limited-time.component';
import { GameCreationPageComponent } from '@app/pages/game-creation-page/game-creation-page.component';
import { GameSelectionComponent } from '@app/pages/game-selection/game-selection.component';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';
import { Routes as RoutesPaths } from './routes';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: RoutesPaths.Home, component: HomePageComponent },
    { path: RoutesPaths.CreatingGame, component: GameCreationPageComponent },
    { path: RoutesPaths.StageSelection, component: GameSelectionComponent },
    { path: RoutesPaths.Config, component: GameSelectionComponent },
    { path: RoutesPaths.Game, component: SoloViewComponent },
    { path: RoutesPaths.LimitedTime, component: LimitedTimeComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
