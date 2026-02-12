import {Component, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FormBuilder, Validators} from "@angular/forms";
import {UserItem} from "../../../../types/users.type";
import {UserService} from "../../../shared/services/user.service";
import {UserCardType} from "../../../../types/user-card.type";
import {CropperImageUtils} from "../../../shared/utils/cropper-image.utils"
import {ImageCropperComponent, ImageCroppedEvent, OutputFormat} from "ngx-image-cropper";
import {CropperImageService} from "../../../shared/services/cropper-image.service";

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['../../../../assets/styles/sharedList.scss'],
  providers: [CropperImageService]
})
export class UserComponent implements OnInit {
  CropperImageUtils = CropperImageUtils;
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild(ImageCropperComponent) imageCropper!: ImageCropperComponent;

  selectedFile = CropperImageUtils.selectedFile;
  avatarPreview = CropperImageUtils.avatarPreview;
  croppedImage = CropperImageUtils.croppedImage;
  originalImageBase64 = CropperImageUtils.originalImageBase64;
  currentRotation = CropperImageUtils.currentRotation;
  currentFlipH = CropperImageUtils.currentFlipH;
  currentFlipV = CropperImageUtils.currentFlipV;
  showCropper = CropperImageUtils.showCropper;
  imageChangedEvent = CropperImageUtils.imageChangedEvent;
  croppedFile = CropperImageUtils.croppedFile;

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


  openFileDialog(): void {
    // Вызываем click() напрямую в компоненте, где есть пользовательское действие
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    // Передаем событие в утилиту для обработки
    CropperImageUtils.onFileSelected(event);
  }

  deleteAvatar(): void {
    if (confirm('Удалить текущую фотографию?')) {
      this.selectedFile = null;
      this.avatarPreview = 'assets/images/default-avatar.png';
      this.cardForm.patchValue({ avatar: '' });
      this.croppedImage = '';
      this.originalImageBase64 = '';
      this.currentRotation = 0;
      this.currentFlipH = false;
      this.currentFlipV = false;

      if (this.showCropper) {
        this.closeCropper();
      }
    }
  }

  closeCropper(): void {
    CropperImageUtils.closeCropper(this.fileInput);
  }

  imageCropped(event: ImageCroppedEvent) {
    CropperImageUtils.imageCropped(event)
  }

  // 5. Изображение загружено в cropper
  onImageLoaded(): void {
    console.log('Изображение загружено в cropper');

    // После загрузки изображения применяем текущие трансформации
    setTimeout(() => {
      this.applyCssTransformToCropper();
    }, 100);
  }

  // Применение CSS трансформаций к самому cropper
  private applyCssTransformToCropper(): void {
    // Пытаемся применить трансформации к внутренним элементам cropper
    const sourceImage = document.querySelector('.ngx-ic-source-image') as HTMLElement;
    const cropperContainer = document.querySelector('.cropper-container') as HTMLElement;

    if (sourceImage) {
      sourceImage.style.transform = CropperImageUtils.getPreviewTransform();
      sourceImage.style.transformOrigin = 'center center';
    }

    if (cropperContainer) {
      cropperContainer.style.transform = CropperImageUtils.getPreviewTransform();
      cropperContainer.style.transformOrigin = 'center center';
    }
  }

  // 6. Ошибка загрузки изображения
  loadImageFailed(): void {
    alert('Не удалось загрузить изображение. Пожалуйста, выберите другой файл.');
    CropperImageUtils.cancelCrop();
  }

  applyCrop(): void {
    console.log('applyCrop вызван');
    console.log('croppedImage существует:', !!this.croppedImage);
    console.log('Текущее значение avatar в форме:', this.cardForm.value.avatar);

    // Проверяем, есть ли обрезанное изображение
    if (!this.croppedImage) {
      console.error('Нет обрезанного изображения!');
      alert('Сначала обрежьте изображение');
      return;
    }

    console.log('Длина croppedImage:', this.croppedImage.length);
    console.log('Трансформации:', {
      rotation: this.currentRotation,
      flipH: this.currentFlipH,
      flipV: this.currentFlipV
    });

    // Применяем трансформации, если они есть
    if (this.currentRotation !== 0 || this.currentFlipH || this.currentFlipV) {
      console.log('Применяем трансформации...');
      CropperImageUtils.applyTransformationsToImage();
    }

    // else {
    //   console.log('Трансформаций нет, сохраняем как есть');
    //   // Только обновляем форму, не трогаем avatarPreview
    //   this.cardNewForm.patchValue({
    //     avatar: this.croppedImage
    //   });
    // }
    // Если нет croppedFile (старая версия cropper), создаем из base64
    if (!this.croppedFile && this.croppedImage && this.selectedFile) {
        const fileName = `avatar_${Date.now()}.${CropperImageUtils.getFormatFromMimeType(this.selectedFile.type)}`;

        // const fileName = this.selectedFile?.name || `avatar_${Date.now()}.png`;
      this.croppedFile = CropperImageUtils.base64ToFile(this.croppedImage, fileName);
    }

    console.log('Файл готов к отправке:', this.croppedFile);
    this.closeCropper();
  }
}
