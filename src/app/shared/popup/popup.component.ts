import {Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {PopupService} from "../services/popup.service";
import {Subject, takeUntil} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
})
export class PopupComponent implements OnInit, OnDestroy {

  title: string = 'Очистить данные из формы?';
  visible: boolean = false;
  private currentConfirmAction?: () => void;
  private popupService = inject(PopupService);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.popupService.popupState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
          this.visible = state.visible;
          if (state.title) {
            this.title = state.title;
          }
          this.currentConfirmAction = state.confirmAction;
      })
  }

  agree() {
    if (this.currentConfirmAction) {
      this.currentConfirmAction()
    }
    this.popupService.respond(true);
    this.popupService.close();
  }
  noAgree() {
    this.popupService.respond(false);
    this.popupService.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
