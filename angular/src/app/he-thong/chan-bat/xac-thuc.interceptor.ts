import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../../environments/environment';

/**
 * Functional HTTP Interceptor tự động gắn Bearer Token cho các yêu cầu gửi đến ABP Backend API
 */
export const xacThucInterceptor: HttpInterceptorFn = (req, next) => {
  const oAuthService = inject(OAuthService);
  const token = oAuthService.getAccessToken();
  const apiUrl = environment.apis.default.url || 'https://localhost:44351';

  if (token && (req.url.startsWith(apiUrl) || req.url.startsWith('/api/'))) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};

