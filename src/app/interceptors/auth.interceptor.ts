import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // 🔐 Get token from localStorage
  const token = localStorage.getItem('token');

  // 🔐 Clone request and attach token if exists
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(authReq).pipe(
    catchError((error) => {

      // 🚫 Redirect ONLY if truly unauthenticated
      if (error.status === 401 && !token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/register']);
      }

      return throwError(() => error);
    })
  );
};
