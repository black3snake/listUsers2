import {ChangeDetectorRef, ElementRef, inject, Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {ImageCroppedEvent, OutputFormat} from "ngx-image-cropper";

@Injectable()
export class CropperImageService {
  // Используем BehaviorSubject для реактивности
  private showCropperSubject = new BehaviorSubject<boolean>(false);
  private avatarPreviewSubject = new BehaviorSubject<string | SafeUrl>('../../../../assets/images/avatar-stub.png');
  private croppedImageSubject = new BehaviorSubject<string>('');
  private croppedFileSubject = new BehaviorSubject<File | null>(null);
  private uploadProgressSubject = new BehaviorSubject<number>(0);
  private isUploadingSubject = new BehaviorSubject<boolean>(false);
  private transformSubject = new BehaviorSubject<{
    rotation: number;
    flipH: boolean;
    flipV: boolean;
  }>({ rotation: 0, flipH: false, flipV: false });

  // Публичные Observable
  showCropper$ = this.showCropperSubject.asObservable();
  avatarPreview$ = this.avatarPreviewSubject.asObservable();
  croppedImage$ = this.croppedImageSubject.asObservable();
  croppedFile$ = this.croppedFileSubject.asObservable();
  uploadProgress$ = this.uploadProgressSubject.asObservable();
  isUploading$ = this.isUploadingSubject.asObservable();
  transform$ = this.transformSubject.asObservable();

  // Состояние
  private showCropper = false;
  private avatarPreview: string | SafeUrl = '../../../../assets/images/avatar-stub.png';
  private croppedImage = '';
  private croppedFile: File | null = null;
  private transform = { rotation: 0, flipH: false, flipV: false };

  // Настройки
  selectedFile: File | null = null;
  imageChangedEvent: any = '';
  originalImageBase64 = '';

  // Конфигурация
  maxFileSizeMB = 1;
  maxFileSizeBytes = this.maxFileSizeMB * 1024 * 1024;
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  cropperFormat: OutputFormat = 'png';
  onlyScaleDown = true;
  imageQuality = 90;
  aspectRatio = 1;
  maintainAspectRatio = true;
  resizeToWidth = 300;

  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);

  // Геттеры и сеттеры
  get showCropperValue(): boolean {
    return this.showCropper;
  }

  set showCropperValue(value: boolean) {
    this.showCropper = value;
    this.showCropperSubject.next(value);
  }

  get avatarPreviewValue(): string | SafeUrl {
    return this.avatarPreview;
  }

  set avatarPreviewValue(value: string | SafeUrl) {
    this.avatarPreview = value;
    this.avatarPreviewSubject.next(value);
  }

  get croppedImageValue(): string {
    return this.croppedImage;
  }

  set croppedImageValue(value: string) {
    this.croppedImage = value;
    this.croppedImageSubject.next(value);
  }

  get croppedFileValue(): File | null {
    return this.croppedFile;
  }

  set croppedFileValue(value: File | null) {
    this.croppedFile = value;
    this.croppedFileSubject.next(value);
  }

  get transformValue(): { rotation: number, flipH: boolean, flipV: boolean } {
    return this.transform;
  }
  set transformValue(value: { rotation: number, flipH: boolean, flipV: boolean }) {
    this.transform = value;
    this.transformSubject.next(value);
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
      this.showCropperValue = true;

      // Сброс трансформаций
      this.transform = { rotation: 0, flipH: false, flipV: false };
      this.transformSubject.next(this.transform);

      // Сохраняем оригинальное изображение
      this.readFileAsBase64(file);
    }
  }

  private readFileAsBase64(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.originalImageBase64 = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  validateFile(file: File): boolean {
    if (!this.allowedTypes.includes(file.type)) {
      alert('Пожалуйста, выберите изображение в формате JPEG, PNG, GIF или WebP.');
      return false;
    }
    if (file.size > this.maxFileSizeBytes) {
      alert(`Файл слишком большой. Максимальный размер ${this.maxFileSizeMB}МБ.`);
      return false;
    }
    if (file.name.length > 100) {
      alert('Имя файла слишком длинное.');
      return false;
    }
    return true;
  }

  closeCropper(fileInput?: ElementRef): void {
    this.showCropperValue = false;
    this.imageChangedEvent = '';

    if (fileInput) {
      fileInput.nativeElement.value = '';
    }
  }

  imageCropped(event: ImageCroppedEvent): void {
    this.croppedImageValue = event.base64 || '';

    if (event.blob && this.selectedFile) {
      const fileName = `avatar_${Date.now()}.${this.getFormatFromMimeType(this.selectedFile.type)}`;
      this.croppedFileValue = this.blobToFile(event.blob, fileName);
    }

    if (event.objectUrl) {
      this.croppedImageValue = event.objectUrl;
      this.avatarPreviewValue = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl);
    } else if (event.base64) {
      this.avatarPreviewValue = event.base64;
    }
  }

  getFormatFromMimeType(mimeType: string): string {
    const mimeToFormat: {[key: string]: string} = {
      'image/jpeg': 'jpeg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'png'
    };
    return mimeToFormat[mimeType] || this.cropperFormat;
  }

  // Трансформации
  changeAspectRatio(ratio: number): void {
    this.aspectRatio = ratio;
  }

  rotateLeft(): void {
    this.transform.rotation -= 90;
    this.transformSubject.next(this.transform);
    this.updatePreview();
  }

  rotateRight(): void {
    this.transform.rotation += 90;
    this.transformSubject.next(this.transform);
    this.updatePreview();
  }

  flipH(): void {
    this.transform.flipH = !this.transform.flipH;
    this.transformSubject.next(this.transform);
    this.updatePreview();
  }

  flipV(): void {
    this.transform.flipV = !this.transform.flipV;
    this.transformSubject.next(this.transform);
    this.updatePreview();
  }

  resetTransform(): void {
    this.transform = { rotation: 0, flipH: false, flipV: false };
    this.transformSubject.next(this.transform);
    this.updatePreview();
  }

  cancelCrop(): void {
    this.closeCropper();
    this.resetTransform();
  }

  getPreviewTransform(): string {
    let transform = '';

    if (this.transform.rotation !== 0) {
      transform += `rotate(${this.transform.rotation}deg) `;
    }
    if (this.transform.flipH) {
      transform += 'scaleX(-1) ';
    }
    if (this.transform.flipV) {
      transform += 'scaleY(-1) ';
    }

    return transform.trim();
  }

  private updatePreview(): void {
    this.cdr.detectChanges();
  }

// Применение трансформаций к изображению
  applyTransformationsToImage(): void {
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

      // if (this.currentRotation % 180 !== 0) {
      if (this.transformValue.rotation % 180 !== 0) {
        [width, height] = [height, width];
      }

      canvas.width = width;
      canvas.height = height;

      // Очищаем canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Настраиваем контекст для трансформаций
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(this.transformValue.rotation * Math.PI / 180);

      if (this.transformValue.flipH) {
        ctx.scale(-1, 1);
      }
      if (this.transformValue.flipV) {
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



// Утилиты
  base64ToFile(base64: string, filename: string): File {
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

  private blobToFile(blob: Blob, fileName: string): File {
    return new File([blob], fileName, {
      type: blob.type,
      lastModified: Date.now()
    });
  }

  // Метод для конфигурации
  configure(config: Partial<CropperImageService>): void {
    Object.assign(this, config);
    this.maxFileSizeBytes = this.maxFileSizeMB * 1024 * 1024;
  }



}
