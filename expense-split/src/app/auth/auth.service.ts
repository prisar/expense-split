import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HelperService } from '../shared/helper.service';
import { Observable } from 'rxjs';
import decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    public jwtHelper: JwtHelperService,
    private helper: HelperService) { }

  // check authentication
  public isAuthenticated(): boolean {
    const access_token = localStorage.getItem('access_token');
    return !this.jwtHelper.isTokenExpired(access_token);
  }

  /**
   * authentication
   * @param info infomation user login
   */
  authentication(info): Observable<any> {
    return this.helper.post('login', info);
  }

  /**
   * get role user
   */
  getRoleUser() {
    const access_token = localStorage.getItem('access_token');
    // decode the token to get its payload
    const tokenPayload = decode(access_token);
    return tokenPayload.role;
  }
}
