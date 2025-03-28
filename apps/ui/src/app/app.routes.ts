import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full',
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./pages/user/user.component').then((m) => m.UserComponent),
  },
  {
    path: 'companies',
    loadComponent: () =>
      import('./pages/company/company.component').then(
        (m) => m.CompanyComponent
      ),
  }
];
