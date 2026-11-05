import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core'; // <-- AÑADIR
import { KatexModule } from 'ng-katex-2'; // <-- AÑADIR
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(KatexModule) // <-- AÑADIR
  ]
};