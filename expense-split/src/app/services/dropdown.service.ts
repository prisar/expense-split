import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DropdownService {
  private urlJson = 'assets/data/';
  constructor(private http: HttpClient) { }

  /**
   * get data dropdown
   */
  getDataDropdown(): Observable<any> {
    return this.http.get(this.urlJson + 'dropdown.json');
  }

   /**
   * get slider data
   */
  getSlider(): Observable<any> {
    return this.http.get(this.urlJson + 'slider.json');
  }
}
