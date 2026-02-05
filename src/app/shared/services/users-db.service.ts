import {Injectable} from '@angular/core';
import {UsersType} from "../../../types/users.type";

@Injectable({
  providedIn: 'root'
})
export class UsersDbService {

  constructor() {
  }

  // getUsers(): UsersType[] {
    // return [
    //   {
    //     "id": 1,
    //     "name": "Gris Kembery",
    //     "email": "gkembery0@wufoo.com",
    //     "active": true,
    //     "avatar": "./assets/images/avatar-stub.png",
    //   }, {
    //     "id": 2,
    //     "name": "Willow Halleybone",
    //     "email": "whalleybone1@dell.com",
    //     "active": true,
    //     "avatar": "./assets/images/avatar-stub.png",
    //   }, {
    //     "id": 3,
    //     "name": "Shannen Hannum",
    //     "email": "shannum2@redcross.org",
    //     "active": true,
    //     "avatar": "./assets/images/avatar-stub.png",
    //   }, {
    //     "id": 4,
    //     "name": "Philomena Wyre",
    //     "email": "pwyre3@spiegel.de",
    //     "active": false,
    //     "avatar": "./assets/images/avatar-stub.png",
    //   }, {
    //     "id": 5,
    //     "name": "Kendell Sugars",
    //     "email": "ksugars4@huffingtonpost.com",
    //     "active": true,
    //     "avatar": "./assets/images/avatar-stub.png",
    //   }, {
    //     "id": 6,
    //     "name": "Clarence Joscelin",
    //     "email": "cjoscelin5@vk.com",
    //     "active": true,
    //     "avatar": "./assets/images/avatar-stub.png",
    //   }, {
    //     "id": 7,
    //     "name": "Lulita Mobbs",
    //     "email": "lmobbs6@bandcamp.com",
    //     "active": true,
    //     "avatar": "./assets/images/avatar-stub.png",
    //   }, {
    //     "id": 8,
    //     "name": "Mohandas Jeannard",
    //     "email": "mjeannard7@merriam-webster.com",
    //     "active": true,
    //     "avatar": "./assets/images/avatar-stub.png",
    //   }, {
    //     "id": 9,
    //     "name": "Fina Phillp",
    //     "email": "fphillp8@marketwatch.com",
    //     "active": false,
    //     "avatar": "./assets/images/avatar-stub.png",
    //   }, {
    //     "id": 10,
    //     "name": "Ginnifer Uphill",
    //     "email": "guphill9@cmu.edu",
    //     "active": true,
    //     "avatar": "./assets/images/avatar-stub.png",
    //   },
    // ]
  //}

  // getUser(id: number): UsersType | null {
  //   const user = this.getUsers().find(user => user.id === id);
  //   if (!user) {
  //     console.log(`User with ID ${id} not found`);
  //     return null;
  //   }
  //   return user;
  // }
}
