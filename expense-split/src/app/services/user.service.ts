import { Injectable } from '@angular/core';
import { HelperService } from '../shared/helper.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private helper: HelperService) { }

  /**
   * get user by id
   * @param id id user
   */
  getUserById(id): Observable<any> {
    return this.helper.get(`user/${id}`);
  }

  /**
   * get User By Name
   * @param name user name
   */
  getUserByName(name): Observable<any> {
    return this.helper.get(`user?name_like=${name}`);
  }

  /**
   * get data user management
   * @param params params
   * @param pagination pagination
   */
  getUsers(parameters: any = {}, pagination: boolean): Observable<any> {
    let params = new HttpParams();
    if (pagination && parameters.pagination) {
      const start: any =  (parameters.pagination.page - 1) * parameters.pagination.perPage;
      params = params.append('_start', start);
      params = params.append('_limit', parameters.pagination.perPage);
    }
    if (parameters.sort && parameters.sort.orderBy && parameters.sort.orderBy !== '') {
      params = params.append('_sort', parameters.sort.orderBy);
      params = params.append('_order', parameters.sort.order);
    }

    if (parameters.filter && parameters.filter.client && parameters.filter.client !== '') {
      params = params.append('client', '2');
    }
    return this.helper.get('user', { params: params});
  }

  /**
   * updates the manage user application
   * @param data data
   */
  updateUser(data: any) {
    return this.helper.put(`user/${data.id}`, data);
  }

  /**
   * add new the manage user application
   * @param data data
   */
  addNewUser(data: any) {
    return this.helper.post('user', data);
  }

  /**
   * updates the manage user application
   * @param id data
   */
  deleteUser(id: any) {
    return this.helper.delete(`user/${id}`);
  }
}
