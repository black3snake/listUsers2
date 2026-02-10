import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {UserComponent} from "./user/user.component";
import {AdduserComponent} from "./adduser/adduser.component";

const routes: Routes = [
  {path: 'user/:url', component: UserComponent},
  {path: 'user', component: AdduserComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListRoutingModule { }
