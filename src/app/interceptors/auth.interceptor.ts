import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 || error.status === 403) {
        // Unauthorized or Forbidden - redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        router.navigate(['/register']);
      }
      return throwError(() => error);
    })
  );
};
