import {ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {UserService} from "../../../shared/services/user.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {UserItem} from "../../../../types/users.type";
import {UserCardType} from "../../../../types/user-card.type";
import {HttpErrorResponse} from "@angular/common/http";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {ImageCropperComponent, ImageCroppedEvent, OutputFormat} from "ngx-image-cropper";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {CropperImageService} from "../../../shared/services/cropper-image.service";
import {PopupService} from "../../../shared/services/popup.service";

@Component({
  selector: 'app-adduser',
  templateUrl: './adduser.component.html',
  styleUrls: ['../../../../assets/styles/sharedList.scss'],
  providers: [CropperImageService]
})
export class AdduserComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild(ImageCropperComponent) imageCropper: any;

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private _snackBar = inject(MatSnackBar);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);
  public cropperService = inject(CropperImageService);
  private patternEmailString: RegExp = /^(?!.*\.\.)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3})$/;
  private popupService = inject(PopupService);

  user: UserItem = {
    id: "",
    firstName: "",
    lastName: "",
    avatar: "../../../../assets/images/avatar-stub.png",
    experience: 0,
    age: 0,
    address: "",
    phone: "",
    email: "",
    active: true,
    createdAt: "",
    url: "",
    reserved: false,
  };

  cardNewForm  = this.fb.group({
    firstName: [{value: '', disabled: false}, Validators.required],
    lastName: [{value: '', disabled: false}, Validators.required],
    age: [{value: '', disabled: false}, [Validators.required,Validators.max(100), Validators.pattern('[0-9]+')]],
    address: [{value: '', disabled: false}, [Validators.required, Validators.pattern('^[а-яА-Я0-9,\\/\\-\\.\\s]+$')]],
    experience: [{value: '', disabled: false}, [Validators.required, Validators.max(50),Validators.pattern('[0-9]+')]],
    email: [{value: '', disabled: false}, [Validators.required, this.emailValidator(this.patternEmailString)]],
    phone: [{value: '', disabled: false}, [Validators.required, Validators.pattern('[0-9]+'), Validators.maxLength(11)]],
    avatar: ['']
  });

  get firstName() {
    return this.cardNewForm.get('firstName');
  }
  get lastName() {
    return this.cardNewForm.get('lastName');
  }
  get age() {
    return this.cardNewForm.get('age');
  }
  get address() {
    return this.cardNewForm.get('address');
  }
  get experience() {
    return this.cardNewForm.get('experience');
  }
  get email() {
    return this.cardNewForm.get('email');
  }
  get phone() {
    return this.cardNewForm.get('phone');
  }

  emailValidator(pattern: RegExp): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const result = pattern.test(control.value);
      return result ? null : {pattern: {value: control.value}};
    }
  }

  saveCard() {
    if(this.cardNewForm.valid && this.cardNewForm.value.firstName && this.cardNewForm.value.lastName && this.cardNewForm.value.age &&
      this.cardNewForm.value.address && this.cardNewForm.value.experience && this.cardNewForm.value.email && this.cardNewForm.value.phone ) {

      const formData = new FormData();
      // Добавляем текстовые поля
      formData.append('firstName', this.cardNewForm.value.firstName);
      formData.append('lastName', this.cardNewForm.value.lastName);
      formData.append('age', this.cardNewForm.value.age.toString());
      formData.append('address', this.cardNewForm.value.address);
      formData.append('experience', this.cardNewForm.value.experience.toString());
      formData.append('email', this.cardNewForm.value.email);
      formData.append('phone', this.cardNewForm.value.phone);

      // Добавляем файл, если он есть
      if (this.cropperService.croppedFileValue) {
        formData.append('avatarFile', this.cropperService.croppedFileValue);
        formData.append('avatar', this.cropperService.croppedFileValue.name.toString());
      } else if (this.cropperService.selectedFile) {
        // Если есть выбранный файл, но еще не обрезанный
        formData.append('avatar', this.cropperService.selectedFile);
      } else {
        // Если файла нет, отправляем stub
        formData.append('avatar', 'avatar-stub.png');
      }

      this.userService.createUserFlexible(formData)
        .subscribe( {
          next: (data: UserCardType | DefaultResponseType) => {
            if ((data as DefaultResponseType).error !== undefined) {
              throw new Error((data as DefaultResponseType).message);
            }
            this._snackBar.open('Пользователь создан');
            // Сброс формы после успешного создания
            this.resetForm();
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
      this.cardNewForm.markAsTouched();
      this._snackBar.open('Заполните необходимые поля формы')
    }
  }


  onFileSelected(event: Event): void {
    this.cropperService.onFileSelected(event);
  }

  openFileDialog(): void {
    this.fileInput.nativeElement.click();
  }

  deleteAvatar() {
    this.popupService.showConfirm(
      'Удалить текущую фотографию?',  // Заголовок
      () => this.deleteAvatarResult()           // Действие при согласии
    );
  }

  deleteAvatarResult(): void {
      this.cropperService.selectedFile = null;
      this.cropperService.avatarPreviewValue = '../../../../assets/images/avatar-stub.png';
      this.cardNewForm.patchValue({ avatar: '' });
      this.cropperService.croppedImageValue = '';
      this.cropperService.originalImageBase64 = '';

      this.cropperService.transformValue = {rotation: 0, flipH: false, flipV: false};

      if (this.cropperService.showCropperValue) {
        this.cropperService.closeCropper();
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
      this.cardNewForm.patchValue({avatar: croppedFile.name})
    }
  }

  resetForm(): void {
      this.cardNewForm.reset();
      this.deleteAvatarResult();

  }

}
