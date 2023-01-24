import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImageComparisonComponent } from '@app/components/image-comparison/image-comparison.component';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomePageComponent },
    { path: 'test', component: ImageComparisonComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
