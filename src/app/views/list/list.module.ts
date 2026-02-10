import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListRoutingModule } from './list-routing.module';
import { AdduserComponent } from './adduser/adduser.component';
import {UserComponent} from "./user/user.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "../../shared/shared.module";
import {ImageCropperComponent} from "ngx-image-cropper";


@NgModule({
  declarations: [
    AdduserComponent,
    UserComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    ListRoutingModule,
    ImageCropperComponent
  ]
})
export class ListModule { }
