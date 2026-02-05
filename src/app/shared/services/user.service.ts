import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ActiveParamsType} from "../../../types/active-params.type";
import {UsersType, UserItem} from "../../../types/users.type";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

  getUsers(params: ActiveParamsType): Observable<UsersType> {
    return this.http.get<UsersType>(environment.apiUrl + 'users', {
      params: params
    });
  }

  getUser(url: string): Observable<UserItem> {
    return this.http.get<UserItem>(environment.apiUrl + 'user/' + url);
  }

  searchUsers(query: string): Observable<UsersType> {
    return this.http.get<UsersType>(environment.apiUrl + 'users/search?query=' + query);
  }

  createUser() {

  }

  deleteUser(url: string) {

  }

  updateUser(id: number, data: UserItem) {

  }

}
