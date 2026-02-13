import {Component, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FormBuilder, Validators} from "@angular/forms";
import {UserItem} from "../../../../types/users.type";
import {UserService} from "../../../shared/services/user.service";
import {UserCardType} from "../../../../types/user-card.type";
import {ImageCropperComponent, ImageCroppedEvent, OutputFormat} from "ngx-image-cropper";
import {CropperImageService} from "../../../shared/services/cropper-image.service";

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['../../../../assets/styles/sharedList.scss'],
  providers: [CropperImageService]
})
export class UserComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild(ImageCropperComponent) imageCropper: any;

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
  public cropperService = inject(CropperImageService);
  isEditCard: boolean = false;

  cardForm = this.fb.group({
    firstName: [{value: '', disabled: true}, Validators.required],
    lastName: [{value: '', disabled: true}, Validators.required],
    age: [{value: '', disabled: true}, Validators.required],
    address: [{value: '', disabled: true}, Validators.required],
    experience: [{value: '', disabled: true}, Validators.required],
    email: [{value: '', disabled: true}, Validators.required],
    phone: [{value: '', disabled: true}, Validators.required],
    avatar: ['']
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
              this.cropperService.avatarPreviewValue = this.user.avatar;

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
        avatar: user.avatar.toString() || '',
      });
    }
  }

  editCard() {
    this.isEditCard = !this.isEditCard;
    if (this.isEditCard) {
      this.cardForm.enable();
    } else {
      this.updateCard(this.user.url)
      this.cardForm.disable();
    }

  }

  updateCard(url: string) {
    const changedValues = this.getChangedValues();
    if (Object.keys(changedValues).length === 0) {
      this._snackBar.open('Нет изменений для сохранения');
      return;
    }
    // Получаем обрезанный файл из сервиса кроппера
    const avatarFile = this.cropperService.croppedFileValue;

    // Удаляем avatar из changedValues, если он там есть
    if (changedValues.hasOwnProperty('avatar') && avatarFile) {
      delete changedValues.avatar;
    }

    this.userService.updateUser(url, changedValues,  avatarFile )
      .subscribe( {
        next: (updatedUser: Partial<UserCardType> ) => {
          this._snackBar.open('Данные обновлены');
          // Обновляем начальные значения
          this.initialFormValues = {
            ...this.initialFormValues,
            ...changedValues
          };
          if (updatedUser.avatar) {
            this.user.avatar = updatedUser.avatar;
            this.cropperService.avatarPreviewValue = updatedUser.avatar;
          }

          // Сбрасываем состояние кроппера
          this.cropperService.croppedFileValue = null;
          this.cropperService.showCropperValue = false;
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

  onFileSelected(event: Event): void {
    this.cropperService.onFileSelected(event);
  }

  openFileDialog(): void {
    this.fileInput.nativeElement.click();
  }

  deleteAvatar(): void {
    if (confirm('Удалить текущую фотографию?')) {
      this.cropperService.selectedFile = null;
      this.cropperService.avatarPreviewValue = '../../../../assets/images/avatar-stub.png';
      this.cardForm.patchValue({ avatar: '' });
      this.cropperService.croppedImageValue = '';
      this.cropperService.originalImageBase64 = '';

      this.cropperService.transformValue = {rotation: 0, flipH: false, flipV: false};

      if (this.cropperService.showCropperValue) {
        this.cropperService.closeCropper();
      }
    }
  }

  imageCropped(event: any): void {
    this.cropperService.imageCropped(event);
  }

  onImageLoaded(): void {
    console.log('Image loaded');
  }

  loadImageFailed(): void {
    console.log('Load image failed');
  }

  applyCrop(): void {
    this.cropperService.applyTransformationsToImage();
    this.cropperService.closeCropper(this.fileInput);

    // Здесь можно отправить файл на сервер
    const croppedFile = this.cropperService.croppedFileValue;
    if (croppedFile) {
      // Ваша логика загрузки
      console.log('File ready for upload:', croppedFile);
      this.cardForm.patchValue({avatar: croppedFile.name})
    }
  }

  resetForm(): void {
    if (confirm('Сбросить все изменения?')) {
      this.cardForm.reset();
      this.deleteAvatar();
    }
  }
}
