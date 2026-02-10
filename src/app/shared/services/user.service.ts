import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ActiveParamsType} from "../../../types/active-params.type";
import {UsersType, UserItem} from "../../../types/users.type";
import {environment} from "../../../environments/environment";
import {UserCardType} from "../../../types/user-card.type";
import {DefaultResponseType} from "../../../types/default-response.type";

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

  createUser(params: UserCardType): Observable<UserCardType | DefaultResponseType> {
    return this.http.post<UserCardType | DefaultResponseType>(environment.apiUrl + 'user', params);
  }

  createUserFlexible(params: UserCardType | FormData): Observable<UserCardType | DefaultResponseType> {
    let options = {};
    if (!(params instanceof FormData)) {
      options = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
    }
    return this.http.post<UserCardType | DefaultResponseType>(
      environment.apiUrl + 'user',
      params,
      options
    );
  }


  deleteUser(url: string) {

  }

  updateUser(url: string, data: Partial<UserCardType>) {
    return this.http.put<Partial<UserCardType>>(environment.apiUrl + 'user/' + url, data);
  }

}
