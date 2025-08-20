import { HttpStatus, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuthService } from 'src/auth/auth.service';
import { BitrixService } from 'src/common/services/bitrix.service';
import { ContactListResponseDto } from '../../dtos/contact/contact.list.response.dto';
import { ContactDto } from '../../dtos/contact/contact.dto';
import { RequisiteDto } from 'src/contact/dtos/requisite/requisite.dto';
import { AddressDto } from 'src/contact/dtos/address/address.dto';
import { BankDto } from 'src/contact/dtos/bank/bank.dto';
import { ArrayUtil } from 'src/common/utils/array.util';
import { ContactInterface } from 'src/contact/interfaces/contact.interface';
import { PhoneInterface } from 'src/contact/interfaces/phone.interface';
import { EmailInterface } from 'src/contact/interfaces/email.interface';
import { WebsiteInterface } from 'src/contact/interfaces/website.interface';
import { AddressInterface } from 'src/contact/interfaces/address.interface';
import { BankInterface } from 'src/contact/interfaces/bank.interface';
import { ContactRequestDto } from 'src/contact/dtos/contact/contact.request.dto';
import { CustomError } from 'src/common/errors/custom.error';
import { MultifieldRequest } from 'src/contact/interfaces/multifield.request.interface';

@Injectable()
export class ContactService {
  constructor(
    private readonly bitrixService: BitrixService,
    private readonly authService: AuthService,
  ) {}
  async getContacts(): Promise<ContactDto[]> {
    // Logic to retrieve contacts
    const rawData = await this.bitrixService.callMethod(
      'crm.contact.list',
      {
        select: [
          'ID',
          'NAME',
          'SECOND_NAME',
          'LAST_NAME',
          'EMAIL',
          'PHONE',
          'WEB',
        ],
      },
      await this.authService.getAccessToken(),
    );

    const response = plainToInstance(ContactListResponseDto, rawData, {
      excludeExtraneousValues: true,
    });

    return response.result || [];
  }

  getAllContactDetails(
    contactDtos: ContactDto[],
    requisiteDtos: RequisiteDto[],
    addressDtos: AddressDto[],
    bankDtos: BankDto[],
  ): ContactInterface[] {
    const requisiteGroup = ArrayUtil.groupBy(requisiteDtos, 'entityId');
    const requisiteMap = ArrayUtil.toMap(
      requisiteGroup,
      '_id',
      (item) => item.value,
    );

    const addressGroup = ArrayUtil.groupBy(addressDtos, 'entityId');
    const addressMap = ArrayUtil.toMap(
      addressGroup,
      '_id',
      (item) => item.value,
    );

    const bankGroup = ArrayUtil.groupBy(bankDtos, 'entityId');
    const bankMap = ArrayUtil.toMap(bankGroup, '_id', (item) => item.value);

    return ArrayUtil.extract(contactDtos, (dto) => {
      const contactDetail: ContactInterface = {
        id: dto.id,
        name: '',
      };

      // Name
      contactDetail.name = ArrayUtil.toString(
        [dto.lastName ?? '', dto.secondName ?? '', dto.name],
        ' ',
      );

      // Phone
      contactDetail.phone = ArrayUtil.extract(dto.phone || [], (item) => {
        const phone: PhoneInterface = {
          id: item.id,
          type: item.valueType,
          value: item.value,
        };
        return phone;
      });

      // Email
      contactDetail.email = ArrayUtil.extract(dto.email || [], (item) => {
        const email: EmailInterface = {
          id: item.id,
          type: item.valueType,
          value: item.value,
        };
        return email;
      });

      // Website
      contactDetail.website = ArrayUtil.extract(dto.web || [], (item) => {
        const website: WebsiteInterface = {
          id: item.id,
          type: item.valueType,
          value: item.value,
        };
        return website;
      });

      const requisites = requisiteMap[dto.id];
      const requisiteIds = ArrayUtil.extract(requisites, 'id');

      // Address
      const addresses: AddressDto[] = [];
      requisiteIds.forEach((id) => {
        addresses.push(...addressMap[id]);
      });
      contactDetail.address = ArrayUtil.extract(addresses, (item) => {
        const address: AddressInterface = {
          typeId: item.typeId,
          entityId: item.entityId,
          address1: item.address1,
          address2: item.address2,
          city: item.city,
          province: item.province,
          country: item.country,
        };
        return address;
      });

      //Bank
      const banks: BankDto[] = [];
      requisiteIds.forEach((id) => {
        banks.push(...bankMap[id]);
      });
      contactDetail.bank = ArrayUtil.extract(banks, (item) => {
        const bank: BankInterface = {
          id: item.id,
          name: item.name,
          accountNumber: item.accountNumber,
        };
        return bank;
      });

      return contactDetail;
    });
  }

  async createContact(contactDto: ContactRequestDto): Promise<number> {
    const selector = (item: MultifieldRequest, objectName: string) => {
      if (!item.value || !item.type) {
        throw new CustomError(
          `Missing value or type for ${objectName} field.`,
          HttpStatus.BAD_REQUEST,
        );
      }

      return {
        VALUE: item.value,
        VALUE_TYPE: item.type,
      };
    };

    const mapMultifield = (data: MultifieldRequest[], name: string) =>
      ArrayUtil.extract(data, (item) => selector(item, name));

    const phone = mapMultifield(contactDto.phone || [], 'phone');
    const email = mapMultifield(contactDto.email || [], 'email');
    const website = mapMultifield(contactDto.website || [], 'website');

    const response: any = await this.bitrixService.callMethod(
      'crm.contact.add',
      {
        fields: {
          NAME: contactDto.firstName,
          SECOND_NAME: null,
          LAST_NAME: contactDto.lastName,
          PHONE: phone,
          EMAIL: email,
          WEB: website,
        },
      },
      await this.authService.getAccessToken(),
    );

    const contactId = response?.result;
    if (!contactId) {
      throw new CustomError(
        'Cannot create contact',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return contactId as number;
  }

  async updateContact(id: string, contactDto: ContactRequestDto) {
    const selector = (item: MultifieldRequest, objectName: string) => {
      if (item.deleted) {
        if (!item.id) {
          throw new CustomError(
            `Cannot delete ${objectName} without providing an ID.`,
            HttpStatus.BAD_REQUEST,
          );
        }

        return {
          ID: item.id,
          DELETE: 'Y',
        };
      }

      if (!item.value || !item.type) {
        throw new CustomError(
          `Missing value or type for ${objectName} field.`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (item.id) {
        return {
          ID: item.id,
          VALUE: item.value,
          VALUE_TYPE: item.type,
        };
      }

      return {
        VALUE: item.value,
        VALUE_TYPE: item.type,
      };
    };

    const mapMultifield = (data: MultifieldRequest[], name: string) =>
      ArrayUtil.extract(data, (item) => selector(item, name));

    const phone = mapMultifield(contactDto.phone || [], 'phone');
    const email = mapMultifield(contactDto.email || [], 'email');
    const website = mapMultifield(contactDto.website || [], 'website');

    const response: any = await this.bitrixService.callMethod(
      'crm.contact.update',
      {
        id: id,
        fields: {
          NAME: contactDto.firstName,
          SECOND_NAME: null,
          LAST_NAME: contactDto.lastName,
          PHONE: phone,
          EMAIL: email,
          WEB: website,
        },
      },
      await this.authService.getAccessToken(),
    );

    const contactId = response?.result;
    if (!contactId) {
      throw new CustomError(
        'Cannot create contact',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return contactId as number;
  }

  async deleteById(id: string | number) {
    await this.bitrixService.callMethod(
      'crm.contact.delete',
      {
        id: id,
      },
      await this.authService.getAccessToken(),
    );
  }
}
