import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {UserItem, UsersType} from "../../../types/users.type";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../shared/services/user.service";
import {ActiveParamsType} from "../../../types/active-params.type";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FormControl} from "@angular/forms";
import {debounceTime, isEmpty, Subject, takeUntil} from "rxjs";
import {ActiveParamsUtil} from "../../shared/utils/active-params.util";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  displayedUsers: UserItem[] = [];
  originalUsers: UserItem[] = [];
  currentSortField: string = '';
  isAscending: boolean = true;
  isFilterActive: boolean = false;
  isNotFilter: boolean = true;
  private isEmpty: boolean = false;
  activeParams: ActiveParamsType = {};
  pages: number[] = [];

  private userService = inject(UserService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private _snackBar = inject(MatSnackBar);
  searchField = new FormControl();
  users: UserItem[] = [];
  showedSearch: boolean = false;
  private destroy$ = new Subject<void>();

  constructor() {
  }

  ngOnInit(): void {

    this.searchField.valueChanges
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        if (value && value.length > 2) {
          this.activeParams.query = value;
          this.isEmpty = false;
        } else if (value.length === 0) {
          delete this.activeParams.query;
          this.isEmpty = false;
        }
        if (value && value.length < 3) {
          this.isEmpty = true
        }

        this.router.navigate(['/users'], {
          queryParams: this.activeParams
        });

      });

    this.activatedRoute.queryParamMap
      .subscribe(queryParamMap => {
        this.activeParams = ActiveParamsUtil.processParams(queryParamMap);
        if (this.searchField.get('query') === null && this.activeParams.query) {
          this.searchField.setValue(this.activeParams.query);
        }
        this.getUsers(this.activeParams, this.isEmpty);

      });


  }

  getUsers(activeParams?: ActiveParamsType, isEmpty: boolean = false) {
    if (!isEmpty) {
      const param = activeParams || {page: 1}
      this.userService.getUsers(param)
        .subscribe({
          next: (datas: UsersType) => {
            this.pages = [];
            for (let i = 1; i <= datas.pagination.totalPages; i++) {
              this.pages.push(i);
            }
            this.displayedUsers = datas.data;
            this.originalUsers = datas.data;

            this.router.navigate(['/users'], {
              queryParams: this.activeParams
            });
          },
          error: (err: HttpErrorResponse) => {
            if (err.error && err.error.message) {
              this._snackBar.open(err.error.message);
            } else {
              this._snackBar.open('Не могу получить доступ к серверу');
            }
          }
        })
    } else {
      this.displayedUsers = [];
      this.pages = [];
    }
  }

  searchResult(activeParams?: ActiveParamsType) {
    this.searchField.valueChanges
      .pipe(
        debounceTime(500),
      )
      .subscribe(value => {
        if (value && value.length > 2) {
          this.userService.searchUsers(value)
            .subscribe({
              next: (datas: UsersType) => {
                this.pages = [];
                for (let i = 1; i <= datas.pagination.totalPages; i++) {
                  this.pages.push(i);
                }
                this.displayedUsers = datas.data;
                this.showedSearch = true;
                this.activeParams = {
                  ...this.activeParams,
                  query: value
                }
                this.router.navigate(['/users/search'], {
                  queryParams: this.activeParams
                });
              },
              error: (err: HttpErrorResponse) => {
                if (err.error && err.error.message) {
                  this._snackBar.open(err.error.message);
                } else {
                  this._snackBar.open('Ошибка ответа от сервера при поиске')
                }
              }
            })
        } else if (value.length === 0) {
          this.getUsers();
          this.showedSearch = false;
        } else {
          this.displayedUsers = [];

        }
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


  // Метод фильтрации локальный
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
    this.router.navigate(['/user', url]);
  }

  newUser() {
    this.router.navigate(['/user']);
  }

  openPrevPage() {
    if (this.activeParams.page && this.activeParams.page > 1) {
      this.activeParams.page--;
      this.router.navigate(['/users'], {
        queryParams: this.activeParams
      });
    }
  }

  openPage(page: number) {
    this.activeParams.page = page;
    this.router.navigate(['/users'], {
      queryParams: this.activeParams
    });
  }

  openNextPage() {
    if (this.activeParams.page && this.activeParams.page < this.pages.length) {
      this.activeParams.page++;
      this.router.navigate(['/users'], {
        queryParams: this.activeParams
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
