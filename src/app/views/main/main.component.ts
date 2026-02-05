import {Component, inject, OnInit} from '@angular/core';
import {UserItem, UsersType} from "../../../types/users.type";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../shared/services/user.service";
import {ActiveParamsType} from "../../../types/active-params.type";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  displayedUsers: UserItem[] = [];
  originalUsers: UserItem[] = [];
  currentSortField: string = '';
  isAscending: boolean = true;
  isFilterActive: boolean = false;
  isNotFilter: boolean = true;
  searchTerm: string = '';
  activeParams: ActiveParamsType = {};
  pages: number[] = [];

  private userService = inject(UserService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private _snackBar = inject(MatSnackBar);

  constructor() {
  }

  ngOnInit(): void {
    this.activatedRoute.queryParamMap
      .subscribe(params => {
        if (params.has('page')) {
          const pageParam = params.get('page');
          if (pageParam !== null) {
            const pageNumber = parseInt(pageParam, 10);
            // Проверяем, что это валидное число больше 0
            if (!isNaN(pageNumber) && pageNumber > 0) {
              this.activeParams.page = pageNumber;
            } else {
              this.activeParams.page = 1;
            }
          }
        } else {
          this.activeParams.page = 1
        }

        this.userService.getUsers(this.activeParams)
          .subscribe({
            next: (datas: UsersType) => {
              this.pages = [];
              for (let i = 1; i <= datas.pagination.page; i++) {
                this.pages.push(i);
              }
              this.displayedUsers = datas.data;
              this.originalUsers = datas.data;
            },
            error: (err: HttpErrorResponse) => {
              if (err.error && err.error.message) {
                this._snackBar.open(err.error.message);
              } else {
                this._snackBar.open('Не могу получить доступ к серверу');
              }
            }
          })
      })


  }

  sortTable(field: string): void {
    // меняем направление, убывание
    if (this.currentSortField === field) {
      this.isAscending = !this.isAscending;
    } else {
      // сортируем по возрастанию
      this.currentSortField = field;
      this.isAscending = true;
    }

    // Выполняем сортировку
    this.displayedUsers.sort((a, b) => {
      let valueA = a[field as keyof UserItem];
      let valueB = b[field as keyof UserItem];

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) {
        return this.isAscending ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.isAscending ? 1 : -1;
      }
      return 0;
    });
  }

  filterByActive(): void {
    if (this.isFilterActive) {
      this.displayedUsers = [...this.originalUsers];
      this.displayedUsers = this.displayedUsers.filter(user => !user.active)
      this.isFilterActive = false;
    } else {
      this.displayedUsers = [...this.originalUsers];
      this.displayedUsers = this.displayedUsers.filter(user => user.active);
      this.isFilterActive = true;
    }
    this.isNotFilter = false;
  }

  resetFilters(): void {
    this.isFilterActive = false;
    this.displayedUsers = [...this.originalUsers];
    this.currentSortField = '';
    this.isNotFilter = true;
  }

  filterUsers() {

  }
  // Метод фильтрации
  // filterUsers(): void {
  //   if (!this.searchTerm) {
  //     this.displayedUsers = this.usersDbService.getUsers();
  //   } else {
  //     const term = this.searchTerm.toLowerCase();
  //     const tempResult: UsersType[] = this.displayedUsers.filter(user =>
  //       user.name.toLowerCase().includes(term)
  //     );
  //     if (tempResult && tempResult.length > 0) {
  //       this.displayedUsers = tempResult;
  //     } else {
  //       this.displayedUsers = this.usersDbService.getUsers();
  //       this.displayedUsers = this.displayedUsers.filter(user =>
  //         user.name.toLowerCase().includes(term)
  //       );
  //     }
  //   }
  //
  //   // Применяем текущую сортировку к отфильтрованным данным
  //   if (this.currentSortField) {
  //     this.sortTable(this.currentSortField);
  //   }
  // }


  chooseUser(url: string) {
    this.router.navigate(['user', url]);
  }

}
