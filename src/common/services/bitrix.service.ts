import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestService } from './request.service';

@Injectable()
export class BitrixService {
  constructor(
    private readonly configService: ConfigService,
    private readonly requestService: RequestService,
  ) {}

  async callMethod<T>(
    method: string,
    payload: Record<string, any> = {},
    access_token: string = '',
  ): Promise<T> {
    const domain = this.configService.get<string>('BITRIX24_DOMAIN');
    const url = `https://${domain}/rest/${method}`;

    return this.requestService.post<T>(url, {
      ...payload,
      auth: access_token,
    });
  }
}

export enum BitrixEntityType {
  LEAD = 1, // Lead (L)
  DEAL = 2, // Deal (D)
  CONTACT = 3, // Contact (C)
  COMPANY = 4, // Company (CO)
  INVOICE = 5, // Invoice (old version) (I)
  SMART_INVOICE = 31, // Invoice (SI)
  QUOTE = 7, // Estimate (Q)
  REQUISITE = 8, // Requisites (RQ)
  SMART_DOCUMENT = 36, // Document (DO)
  SMART_B2E_DOC = 39, // Company Document (SBD)
  DYNAMIC_177 = 177, // Equipment Purchase (Tb1)
  DYNAMIC_156 = 156, // Purchase (T9c)
}

export enum BitrixAddressType {
  DELIVERY = 11, // Delivery Address
  ACTUAL = 1, // Actual Address
  LEGAL = 6, // Legal Address
  REGISTRATION = 4, // Registration Address
  CORRESPONDENCE = 8, // Correspondence Address
  BENEFICIARY = 9, // Beneficiary Address
}

export enum RequisiteTemplate {
  ORGANIZATION = 1,
  SOLE_PROPRIETOR = 2,
  INDIVIDUAL = 3,
  ORGANIZATION_ADDITIONAL = 4,
}
