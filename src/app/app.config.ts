import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from './environment';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideAnimations(),
        provideAnimationsAsync(),
        { provide: FIREBASE_OPTIONS, useValue: environment.firebase },
        provideFirebaseApp(() => initializeApp())
    ]
};
