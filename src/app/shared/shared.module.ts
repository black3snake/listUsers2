import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SymbolLessPipe } from './pipes/symbol-less.pipe';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";



@NgModule({
  declarations: [
    SymbolLessPipe
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  exports: [
    SymbolLessPipe
  ]
})
export class SharedModule { }
