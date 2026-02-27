import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  private popupState = new Subject<{
    visible: boolean,
    title: string,
    confirmAction?: () => void
  }>();
  private confirmResponse = new Subject<boolean>();

  popupState$ = this.popupState.asObservable();
  confirmResponse$ = this.confirmResponse.asObservable();

  showConfirm(title: string, confirmAction: () => void): void {
    this.popupState.next({
      visible: true,
      title: title,
      confirmAction: confirmAction
    });
  }

  respond(confirmed: boolean): void {
    this.confirmResponse.next(confirmed);
  }
  close(): void {
    this.popupState.next({
      visible: false,
      title: ''
    });
  }
}
