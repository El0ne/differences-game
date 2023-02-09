import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameSelectionComponent } from '@app/pages/game-selection/game-selection.component';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomePageComponent },
    { path: 'stage-selection', component: GameSelectionComponent },
    { path: 'config', component: GameSelectionComponent },
    { path: 'soloView', component: SoloViewComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
