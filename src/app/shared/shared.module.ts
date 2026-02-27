import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SymbolLessPipe } from './pipes/symbol-less.pipe';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { PopupComponent } from './popup/popup.component';



@NgModule({
  declarations: [
    SymbolLessPipe,
    PopupComponent
  ],
  imports: [
    CommonModule,
    // ReactiveFormsModule,
    // FormsModule,
  ],
  exports: [
    SymbolLessPipe,
    PopupComponent
  ]
})
export class SharedModule { }
