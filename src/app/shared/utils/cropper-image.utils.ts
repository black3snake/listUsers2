import {ImageCropperComponent, ImageCroppedEvent, OutputFormat} from "ngx-image-cropper";
import {ChangeDetectorRef, ElementRef, inject, ViewChild} from "@angular/core";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";

export class CropperImageUtils {

  private static sanitizer = inject(DomSanitizer);
  private static cdr = inject(ChangeDetectorRef);

  // Переменные для загрузки изображений
  static selectedFile: File | null = null;
  static avatarPreview: string | SafeUrl = 'assets/images/default-avatar.png';
  static imageChangedEvent: any = '';
  static showCropper = false;
  static croppedImage: string = '';
  static croppedFile: File | null = null; // Добавляем переменную для хранения файла
  static originalImageBase64: string = ''; // Сохраняем оригинальное изображение

  // Свойства для трансформаций (храним отдельно)
  static currentRotation = 0;
  static currentFlipH = false;
  static currentFlipV = false;

  // Ограничения
  static maxFileSizeMB = 1;
  static maxFileSizeBytes = this.maxFileSizeMB * 1024 * 1024;
  static allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  // Состояния загрузки
  static isUploading = false;
  static uploadProgress = 0;

  // Для версии 8.1.1 используем отдельные настройки
  static cropperFormat: OutputFormat = 'png';
  static onlyScaleDown = true;
  static imageQuality = 90;

  // Настройки обрезки
  static aspectRatio = 1;
  static maintainAspectRatio = true;
  static resizeToWidth = 300;

  static onFileSelected(event: Event): void {
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

  private static readFileAsBase64(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.originalImageBase64 = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  static validateFile(file: File): boolean {
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

  static closeCropper(fileInput?: ElementRef): void {
    this.showCropper = false;
    this.imageChangedEvent = '';

    // Очистка input file
    if (fileInput) {
      fileInput.nativeElement.value = '';
    }
  }

  // Метод для конвертации base64 в File
  static base64ToFile(base64: string, filename: string): File {
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

  private static blobToFile(blob: Blob, fileName: string): File {
    const file = new File([blob], fileName, {
      type: blob.type,
      lastModified: Date.now()
    });
    return file;
  }

  //4. Обработка обрезки изображения
  static imageCropped(event: ImageCroppedEvent): void {
    console.log('Событие imageCropped вызвано');
    console.log('Есть ли base64:', !!event.base64);
    console.log('Есть ли objectUrl:', !!event.objectUrl);

    this.croppedImage = event.base64 || '';
    // Сохраняем blob для конвертации в файл
    if (event.blob) {
      // Конвертируем blob в файл
      // const fileName = this.selectedFile?.name || `avatar_${Date.now()}.${this.cropperFormat}`;
      if (this.selectedFile) {
        const fileName = `avatar_${Date.now()}.${this.getFormatFromMimeType(this.selectedFile.type)}`;
        this.croppedFile = this.blobToFile(event.blob, fileName);
      }
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



  static getFormatFromMimeType(mimeType: string): string {
    const mimeToFormat: {[key: string]: string} = {
      'image/jpeg': 'jpeg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'png' // конвертируем gif в png
    };

    return mimeToFormat[mimeType] || this.cropperFormat;
  }


  // 16. Изменение соотношения сторон
  static changeAspectRatio(ratio: number): void {
    this.aspectRatio = ratio;
  }

  // Методы трансформации
  static rotateLeft(): void {
    this.currentRotation -= 90;
    this.updatePreview();
  }

  static rotateRight(): void {
    this.currentRotation += 90;
    this.updatePreview();
  }

  static flipH(): void {
    this.currentFlipH = !this.currentFlipH;
    this.updatePreview();
  }

  static flipV(): void {
    this.currentFlipV = !this.currentFlipV;
    this.updatePreview();
  }

  // Сброс трансформаций
  static resetTransform(): void {
    this.currentRotation = 0;
    this.currentFlipH = false;
    this.currentFlipV = false;
    this.updatePreview();
  }

  static cancelCrop(): void {
    this.closeCropper();
    this.currentRotation = 0;
    this.currentFlipH = false;
    this.currentFlipV = false;
  }

  // Обновление предпросмотра
  private static updatePreview(): void {
    console.log('Трансформации обновлены:', {
      rotation: this.currentRotation,
      flipH: this.currentFlipH,
      flipV: this.currentFlipV
    });

    // Force update (для Angular Change Detection)
    this.cdr.detectChanges();
  }

  // Метод для получения CSS трансформаций для предпросмотра
  static getPreviewTransform(): string {
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

  // Применение трансформаций к изображению
  static applyTransformationsToImage(): void {
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


}
