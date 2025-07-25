import type { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component').then((m) => m.AdminComponent),
  },
  {
    path: '',
    redirectTo: 'admin',
    pathMatch: 'full',
  },
];
