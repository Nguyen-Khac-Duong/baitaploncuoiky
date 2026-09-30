import { Environment } from '@abp/ng.core';

const baseUrl = 'http://localhost:4200';

export const environment = {
  production: false,
  application: {
    baseUrl,
    name: 'testtttt88',
    logoUrl: '',
  },
  oAuthConfig: {
    issuer: 'https://localhost:44351/',
    redirectUri: baseUrl,
    clientId: 'testtttt88_App',
    responseType: 'code',
    scope: 'offline_access testtttt88',
    requireHttps: true,
  },
  apis: {
    default: {
      url: 'https://localhost:44351',
      rootNamespace: 'testtttt88',
    },
  },
} as Environment;
