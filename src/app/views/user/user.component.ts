import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {UserItem} from "../../../types/users.type";
import {UserService} from "../../shared/services/user.service";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FormBuilder, Validators} from "@angular/forms";

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
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

}
