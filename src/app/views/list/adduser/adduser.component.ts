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

@Component({
  selector: 'app-adduser',
  templateUrl: './adduser.component.html',
  styleUrls: ['../../../../assets/styles/sharedList.scss']
})
export class AdduserComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild(ImageCropperComponent) imageCropper!: ImageCropperComponent;

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private _snackBar = inject(MatSnackBar);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);
  private patternEmailString: RegExp = /^(?!.*\.\.)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2})$/;

  // Переменные для загрузки изображений
  selectedFile: File | null = null;
  avatarPreview: string | SafeUrl = 'images/avatar-stub.png';
  showCropper = false;
  imageChangedEvent: any = '';
  croppedImage: string = '';
  croppedFile: File | null = null; // Добавляем переменную для хранения файла
  originalImageBase64: string = ''; // Сохраняем оригинальное изображение

  // Настройки обрезки
  aspectRatio = 1;
  maintainAspectRatio = true;
  resizeToWidth = 300;

  // Для версии 8.1.1 используем отдельные настройки
  cropperFormat: OutputFormat = 'png';
  onlyScaleDown = true;
  imageQuality = 90;

  // Свойства для трансформаций (храним отдельно)
  currentRotation = 0;
  currentFlipH = false;
  currentFlipV = false;

  // Ограничения
  maxFileSizeMB = 1;
  maxFileSizeBytes = this.maxFileSizeMB * 1024 * 1024;
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  // Состояния загрузки
  isUploading = false;
  uploadProgress = 0;

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
    url: ""
  };

  cardNewForm  = this.fb.group({
    firstName: [{value: '', disabled: false}, Validators.required],
    lastName: [{value: '', disabled: false}, Validators.required],
    age: [{value: '', disabled: false}, [Validators.required,Validators.max(100)]],
    address: [{value: '', disabled: false}, Validators.required],
    experience: [{value: '', disabled: false}, [Validators.required, Validators.max(50)]],
    email: [{value: '', disabled: false}, [Validators.required, this.emailValidator(this.patternEmailString)]],
    phone: [{value: '', disabled: false}, Validators.required],
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

  ngOnInit(): void {
  }

  saveCard() {
    if(this.cardNewForm.valid && this.cardNewForm.value.firstName && this.cardNewForm.value.lastName && this.cardNewForm.value.age &&
      this.cardNewForm.value.address && this.cardNewForm.value.experience && this.cardNewForm.value.email && this.cardNewForm.value.phone ) {
      // const paramsObject: UserCardType = {
      //   firstName: this.cardNewForm.value.firstName,
      //   lastName: this.cardNewForm.value.lastName,
      //   age: this.cardNewForm.value.age,
      //   address: this.cardNewForm.value.address,
      //   experience: this.cardNewForm.value.experience,
      //   email: this.cardNewForm.value.email,
      //   phone: this.cardNewForm.value.phone,
      //   avatar: this.cardNewForm.value.avatar ? this.cardNewForm.value.avatar : 'avatar-stub.png'
      // }

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
      if (this.croppedFile) {
        formData.append('avatar', this.croppedFile);
      } else if (this.selectedFile) {
        // Если есть выбранный файл, но еще не обрезанный
        formData.append('avatar', this.selectedFile);
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

  // Метод для конвертации base64 в File
  private base64ToFile(base64: string, filename: string): File {
    // Удаляем префикс data:image/xxx;base64, если он есть
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, {type: mime});
  }


  // Метод для конвертации Blob в File
  private blobToFile(blob: Blob, fileName: string): File {
    const file = new File([blob], fileName, {
      type: blob.type,
      lastModified: Date.now()
    });
    return file;
  }

  // методы для модального окна
  // работа с ngx-image-cropper
  openFileDialog(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!this.validateFile(file)) {
        return;
      }

      this.selectedFile = file;
      this.imageChangedEvent = event;
      this.showCropper = true;

      // Сброс progress bar
      this.uploadProgress = 0;
      // Сброс трансформаций при новом файле
      this.currentRotation = 0;
      this.currentFlipH = false;
      this.currentFlipV = false;

      // Сохраняем оригинальное изображение для дальнейших трансформаций
      this.readFileAsBase64(file);
    }
  }

  // Чтение файла как base64
  private readFileAsBase64(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.originalImageBase64 = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  validateFile(file: File): boolean {
    // Проверка типа файла
    if (!this.allowedTypes.includes(file.type)) {
      alert('Пожалуйста, выберите изображение в формате JPEG, PNG, GIF или WebP.');
      return false;
    }
    // Проверка размера файла
    if (file.size > this.maxFileSizeBytes) {
      alert(`Файл слишком большой. Максимальный размер ${this.maxFileSizeMB}МБ.`);
      return false;
    }
    // Проверка имени файла
    if (file.name.length > 100) {
      alert('Имя файла слишком длинное.');
      return false;
    }
    return true;
  }


  private closeCropper(): void {
    this.showCropper = false;
    this.imageChangedEvent = '';

    // Очистка input file
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  deleteAvatar(): void {
    if (confirm('Удалить текущую фотографию?')) {
      this.selectedFile = null;
      this.avatarPreview = 'images/avatar-stub.png';
      this.cardNewForm.patchValue({ avatar: '' });
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


  // 4. Обработка обрезки изображения
  imageCropped(event: ImageCroppedEvent): void {
    console.log('Событие imageCropped вызвано');
    console.log('Есть ли base64:', !!event.base64);
    console.log('Есть ли objectUrl:', !!event.objectUrl);

    this.croppedImage = event.base64 || '';
    // Сохраняем blob для конвертации в файл
    if (event.blob) {
      // Конвертируем blob в файл
      // const fileName = this.selectedFile?.name || `avatar_${Date.now()}.${this.cropperFormat}`;
      const fileName = `avatar_${Date.now()}.${this.cropperFormat}`;
      this.croppedFile = this.blobToFile(event.blob, fileName);
      console.log('Файл создан:', this.croppedFile);
    }

    // Создаем SafeUrl для предпросмотра
    if (event.objectUrl) {
      console.log('Используем objectUrl');
      this.croppedImage = event.objectUrl;
      this.avatarPreview = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl);
    } else if (event.base64) {
      this.avatarPreview = event.base64;
    }
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
      sourceImage.style.transform = this.getPreviewTransform();
      sourceImage.style.transformOrigin = 'center center';
    }

    if (cropperContainer) {
      cropperContainer.style.transform = this.getPreviewTransform();
      cropperContainer.style.transformOrigin = 'center center';
    }
  }

  // 6. Ошибка загрузки изображения
  loadImageFailed(): void {
    alert('Не удалось загрузить изображение. Пожалуйста, выберите другой файл.');
    this.cancelCrop();
  }

  applyCrop(): void {
    console.log('applyCrop вызван');
    console.log('croppedImage существует:', !!this.croppedImage);
    console.log('Текущее значение avatar в форме:', this.cardNewForm.value.avatar);

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
      this.applyTransformationsToImage();
    }

    // else {
    //   console.log('Трансформаций нет, сохраняем как есть');
    //   // Только обновляем форму, не трогаем avatarPreview
    //   this.cardNewForm.patchValue({
    //     avatar: this.croppedImage
    //   });
    // }
    // Если нет croppedFile (старая версия cropper), создаем из base64
    if (!this.croppedFile && this.croppedImage) {
      const fileName = this.selectedFile?.name || `avatar_${Date.now()}.png`;
      this.croppedFile = this.base64ToFile(this.croppedImage, fileName);
    }

    console.log('Файл готов к отправке:', this.croppedFile);
    this.closeCropper();
  }

  // Применение трансформаций к изображению
  private applyTransformationsToImage(): void {
    if (!this.croppedImage) return;

    const img = new Image();
    img.src = this.croppedImage;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Рассчитываем размеры с учетом поворота
      let width = img.width;
      let height = img.height;

      if (this.currentRotation % 180 !== 0) {
        [width, height] = [height, width];
      }

      canvas.width = width;
      canvas.height = height;

      // Очищаем canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Настраиваем контекст для трансформаций
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(this.currentRotation * Math.PI / 180);

      if (this.currentFlipH) {
        ctx.scale(-1, 1);
      }
      if (this.currentFlipV) {
        ctx.scale(1, -1);
      }

      // Рисуем изображение
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      // Получаем трансформированное изображение
      const transformedImage = canvas.toDataURL('image/png', this.imageQuality / 100);

      // Обновляем preview
      this.avatarPreview = transformedImage;

      // Обновляем croppedImage
      this.croppedImage = transformedImage;

      // Создаем новый файл из трансформированного изображения
      const fileName = this.selectedFile?.name || `avatar_${Date.now()}_transformed.png`;
      this.croppedFile = this.base64ToFile(transformedImage, fileName);
    };
  }

  cancelCrop(): void {
    this.closeCropper();
    this.currentRotation = 0;
    this.currentFlipH = false;
    this.currentFlipV = false;
  }


  resetForm(): void {
    if (confirm('Сбросить все изменения?')) {
      this.cardNewForm.reset();
      this.deleteAvatar();
    }
  }

  // 16. Изменение соотношения сторон
  changeAspectRatio(ratio: number): void {
    this.aspectRatio = ratio;
  }

  // Методы трансформации
  rotateLeft(): void {
    this.currentRotation -= 90;
    this.updatePreview();
  }

  rotateRight(): void {
    this.currentRotation += 90;
    this.updatePreview();
  }

  flipH(): void {
    this.currentFlipH = !this.currentFlipH;
    this.updatePreview();
  }

  flipV(): void {
    this.currentFlipV = !this.currentFlipV;
    this.updatePreview();
  }

// Сброс трансформаций
  resetTransform(): void {
    this.currentRotation = 0;
    this.currentFlipH = false;
    this.currentFlipV = false;
    this.updatePreview();
  }

// Обновление предпросмотра
  private updatePreview(): void {
    console.log('Трансформации обновлены:', {
      rotation: this.currentRotation,
      flipH: this.currentFlipH,
      flipV: this.currentFlipV
    });

    // Force update (для Angular Change Detection)
    this.cdr.detectChanges();
  }



  // Метод для получения CSS трансформаций для предпросмотра
  getPreviewTransform(): string {
    let transform = '';

    // Поворот
    if (this.currentRotation !== 0) {
      transform += `rotate(${this.currentRotation}deg) `;
    }

    // Отражение по горизонтали
    if (this.currentFlipH) {
      transform += 'scaleX(-1) ';
    }

    // Отражение по вертикали
    if (this.currentFlipV) {
      transform += 'scaleY(-1) ';
    }

    return transform.trim();
  }


}
