import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FormBuilder, Validators} from "@angular/forms";
import {UserItem} from "../../../../types/users.type";
import {UserService} from "../../../shared/services/user.service";
import {UserCardType} from "../../../../types/user-card.type";

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['../../../../assets/styles/sharedList.scss']
})
export class UserComponent implements OnInit {

  user: UserItem = {
    id: "",
    firstName: "",
    lastName: "",
    avatar: "",
    experience: 0,
    age: 0,
    address: "",
    phone: "",
    email: "",
    active: true,
    createdAt: "",
    url: ""
  };
  private activatedRoute = inject(ActivatedRoute);
  private userService = inject(UserService);
  private _snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private initialFormValues!: UserCardType;
  isEditCard: boolean = false;

  cardForm = this.fb.group({
    firstName: [{value: '', disabled: true}, Validators.required],
    lastName: [{value: '', disabled: true}, Validators.required],
    age: [{value: '', disabled: true}, Validators.required],
    address: [{value: '', disabled: true}, Validators.required],
    experience: [{value: '', disabled: true}, Validators.required],
    email: [{value: '', disabled: true}, Validators.required],
    phone: [{value: '', disabled: true}, Validators.required],
  });

  get firstName() {
    return this.cardForm.get('firstName');
  }
  get lastName() {
    return this.cardForm.get('lastName');
  }
  get age() {
    return this.cardForm.get('age');
  }
  get address() {
    return this.cardForm.get('address');
  }
  get experience() {
    return this.cardForm.get('experience');
  }
  get email() {
    return this.cardForm.get('email');
  }
  get phone() {
    return this.cardForm.get('phone');
  }



  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      if (params['url']) {
        // console.log(params['url']);
        this.userService.getUser(params['url'])
          .subscribe( {
            next: (data: UserItem) => {
              this.user = data;
              this.loadingDataForm(this.user);
              this.initialFormValues = this.cardForm.getRawValue();

            },
            error: (err: HttpErrorResponse) => {
              if (err.error && err.error.message) {
                this._snackBar.open(err.error.message);
              } else {
                this._snackBar.open('Не могу получить доступ к серверу');
              }
            }
          })

      }
    });
  }

  loadingDataForm(user: UserItem) {
    if (user) {
      this.cardForm.patchValue({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        age: user.age?.toString() || '',
        address: user.address || '',
        experience: user.experience?.toString() || '',
        phone: user.phone?.toString() || '',
        email: user.email?.toString() || '',
      });
    }
  }

  editCard() {
    this.isEditCard = !this.isEditCard;
    if (this.isEditCard) {
      this.cardForm.enable();
    } else {
      this.updateCard(this.user.id)
      this.cardForm.disable();
    }

  }

  updateCard(id: string) {
    const changedValues = this.getChangedValues();
    if (Object.keys(changedValues).length === 0) {
      this._snackBar.open('Нет изменений для сохранения');
      return;
    }

    this.userService.updateUser(id, changedValues )
      .subscribe( {
        next: (updateUser: Partial<UserCardType> ) => {
          this._snackBar.open('Данные обновлены');
          // Обновляем начальные значения
          this.initialFormValues = { ...this.initialFormValues, ...changedValues };
        },
        error: (err: HttpErrorResponse) => {
          if (err.error && err.error.message) {
            this._snackBar.open(err.error.message);
          } else {
            this._snackBar.open('Не могу получить доступ к серверу');
          }
        }
      })
  }

  getChangedValues(): Partial<UserCardType> {
    const currentValues: UserCardType = this.cardForm.getRawValue();
    const changedValues: Partial<UserCardType> = {};
    Object.keys(currentValues).forEach(key => {
      const typedKey = key as keyof UserCardType;
      const currentValue = currentValues[typedKey];
      const initialValue = this.initialFormValues[typedKey];

      // Сравниваем значения (учитываем разные типы)
      if (JSON.stringify(currentValue) !== JSON.stringify(initialValue)) {
        changedValues[typedKey] = currentValue;
      }
    });
    return changedValues;
  }


}
