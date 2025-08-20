import { AddressInterface } from './address.interface';
import { BankInterface } from './bank.interface';
import { EmailInterface } from './email.interface';
import { PhoneInterface } from './phone.interface';
import { WebsiteInterface } from './website.interface';

export interface ContactInterface {
  id: string;
  name: string;
  address?: AddressInterface[];
  phone?: PhoneInterface[];
  email?: EmailInterface[];
  website?: WebsiteInterface[];
  bank?: BankInterface[];
}
