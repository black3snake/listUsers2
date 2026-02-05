export type UserItem = {
  id: string,
  firstName: string,
  lastName: string,
  avatar: string,
  experience: number,
  age: number,
  address: string,
  active: boolean,
  url: string,
  phone: string,
  email: string,
  createdAt: Date | string, // или просто Date, если контролируете
};

export type PaginationType = {
  page: number,
  itemsPerPage: number,
  total: number,
  totalPages: number,
};

export type UsersType = {
  data: UserItem[],
  pagination: PaginationType,
};

