import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // console.log('Request body type:', request.body instanceof FormData ? 'FormData' : 'JSON');
    // console.log('Original Content-Type:', request.headers.get('Content-Type'));

    let headers = request.headers;
    if (!(request.body instanceof FormData)) {
      headers = headers.set('Content-Type', 'application/json');

      const authReq = request.clone({ headers });
      // console.log('Set Content-Type to application/json');
      return next.handle(authReq);
    } else {
      console.log('Keeping original headers for FormData');
    }

    return next.handle(request);
  }
}
