import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable()
export class HelperService {
  public API_BASE_URL: string = environment.baseApiUrl;
  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  /**
  * Performs a request with `get` http method.
  * @param url the url
  * @param options the request options
  */
  get(url: string, options?: any): Observable<any> {
    return this.http
      .get(`${this.API_BASE_URL}${url}`, this.requestOptions(options))
      .pipe(catchError(err => this.catchAuthError(err)));
  }


  /**
   * Performs a request with `post` http method.
   * @param url the url
   * @param body the body
   * @param options the request options
   * @param isUpload the flag if the request is made for upload
   */
  post(url: string, body: any, options?: any): Observable<any> {
    return this.http
      .post(`${this.API_BASE_URL}${url}`, body, this.requestOptions(options))
      .pipe(catchError(err => this.catchAuthError(err)));
  }

  /**
   * Performs a request with `put` http method.
   * @param url the url
   * @param body the body
   * @param options the request options
   */
  put(url: string, body?: any, options?: any): Observable<any> {
    return this.http.put(`${this.API_BASE_URL}${url}`, body, this.requestOptions(options))
      .pipe(catchError(err => this.catchAuthError(err)));
  }

  /**
   * Performs a request with `delete` http method.
   * @param url the url
   * @param options the request options
   */
  delete(url: string, options?: any): Observable<any> {
    return this.http
      .delete(`${this.API_BASE_URL}${url}`, this.requestOptions(options))
      .pipe(catchError(err => this.catchAuthError(err)));
  }

  /**
   * config option
   * @param options data options
   */
  private requestOptions(options?: any): any {
    if (localStorage.getItem('access_token')) {
      if (!options) {
        options = {};
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'authentication': 'Bearer ' + localStorage.getItem('access_token')
        });
        options.headers = headers;
      }
    } else {
      if (!options) {
        options = {};
        const headers = new HttpHeaders({
          'Content-Type': 'application/json'
        });
        options.headers = headers;
      }
    }
    return options;
  }


  /**
   * catches the auth error
   * @param error the error response
   */
  catchAuthError(error: Response): Observable<Response> {
    if (error.status === 401) {
      this.router.navigate(['/login']);
      return throwError(error);
    }
  }
}
