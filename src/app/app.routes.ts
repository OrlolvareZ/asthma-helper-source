import { Routes } from '@angular/router';
import { OnOffComponent } from './on-off/on-off.component';
import { FishServerComponent } from './fish-server/fish-server.component';

export const routes: Routes = [
    {
        path: 'on-off',
        component: OnOffComponent
    },
    {
        path: 'fish-serve',
        component: FishServerComponent
    },
];
