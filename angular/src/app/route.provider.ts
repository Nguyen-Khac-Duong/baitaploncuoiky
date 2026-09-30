import { RoutesService, eLayoutType } from '@abp/ng.core';
import { APP_INITIALIZER } from '@angular/core';

export const APP_ROUTE_PROVIDER = [
  { provide: APP_INITIALIZER, useFactory: configureRoutes, deps: [RoutesService], multi: true },
];

function configureRoutes(routesService: RoutesService) {
  return () => {
    routesService.add([
      {
        path: '/cua-hang',
        name: '::Menu:Storefront',
        iconClass: 'fas fa-shopping-bag',
        order: 1,
        layout: eLayoutType.empty,
      },
      {
        path: '/admin/tong-quan',
        name: '::Menu:Dashboard',
        iconClass: 'fas fa-chart-line',
        order: 2,
        layout: eLayoutType.empty,
      },
      {
        path: '/admin/san-pham',
        name: '::Menu:Products',
        iconClass: 'fas fa-boxes',
        order: 3,
        layout: eLayoutType.empty,
      },
      {
        path: '/admin/don-hang',
        name: '::Menu:Orders',
        iconClass: 'fas fa-receipt',
        order: 4,
        layout: eLayoutType.empty,
      }
    ]);
  };
}
