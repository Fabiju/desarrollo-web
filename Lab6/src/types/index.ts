export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export type ContactInput = Omit<Contact, 'id'>;

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginResponse extends User {
  accessToken: string;
  refreshToken: string;
}
