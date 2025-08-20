import { HttpStatus, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuthService } from 'src/auth/auth.service';
import { CustomError } from 'src/common/errors/custom.error';
import {
  BitrixEntityType,
  BitrixService,
} from 'src/common/services/bitrix.service';
import { AddressDto } from 'src/contact/dtos/address/address.dto';
import { AddressListResponseDto } from 'src/contact/dtos/address/address.list.response.dto';
import {
  AddressRequestDto,
  ContactRequestDto,
} from 'src/contact/dtos/contact/contact.request.dto';
import { ContactUpdateDto } from 'src/contact/dtos/contact/contact.update.dto';
import { AddressInterface } from 'src/contact/interfaces/address.interface';

@Injectable()
export class AddressService {
  constructor(
    private readonly bitrixService: BitrixService,
    private readonly authService: AuthService,
  ) {}

  async getByRequisites(requisiteIds: string[]): Promise<AddressDto[]> {
    const rawData = await this.bitrixService.callMethod(
      'crm.address.list',
      {
        filter: {
          ENTITY_TYPE_ID: BitrixEntityType.REQUISITE,
          '@ENTITY_ID': requisiteIds,
        },
      },
      await this.authService.getAccessToken(),
    );

    const response = plainToInstance(AddressListResponseDto, rawData, {
      excludeExtraneousValues: true,
    });

    return response.result || [];
  }

  async createByRequisite(requisiteId: number, contactDto: ContactRequestDto) {
    const address = contactDto.address || [];
    for (let i = 0; i < address.length; i++) {
      await this.create({
        entityId: requisiteId.toString(),
        typeId: address[i].typeId.toString(),
        address1: address[i].address1,
        address2: address[i].address2,
        city: address[i].city,
        province: address[i].province,
        country: address[i].country,
      });
    }
  }

  async massUpdate(requisiteId: number | string, contactDto: ContactUpdateDto) {
    const addresses = contactDto.address || [];

    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];

      if (address.deleted) {
        if (!address.entityId) {
          throw new CustomError(
            `Cannot delete at index ${i} without an requisite id.`,
            HttpStatus.BAD_REQUEST,
          );
        }
        await this.delete({
          entityId: address.entityId,
          typeId: address.typeId.toString(),
        });
        continue;
      }

      if (address.entityId) {
        await this.update({
          entityId: address.entityId,
          typeId: address.typeId.toString(),
          address1: address.address1,
          address2: address.address2,
          city: address.city,
          province: address.province,
          country: address.country,
        });
      } else {
        await this.create({
          entityId: requisiteId.toString(),
          typeId: address.typeId.toString(),
          address1: address.address1,
          address2: address.address2,
          city: address.city,
          province: address.province,
          country: address.country,
        });
      }
    }
  }

  async create(data: AddressInterface) {
    const response: any = await this.bitrixService.callMethod(
      'crm.address.add',
      {
        fields: {
          TYPE_ID: data.typeId,
          ENTITY_TYPE_ID: BitrixEntityType.REQUISITE,
          ENTITY_ID: data.entityId,
          ADDRESS_1: data.address1,
          ADDRESS_2: data.address2,
          CITY: data.city,
          PROVINCE: data.province,
          COUNTRY: data.country,
        },
      },
      await this.authService.getAccessToken(),
    );

    const result = response?.result;
    if (!result) {
      throw new CustomError(
        'Cannot create requisite',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(data: AddressInterface) {
    await this.bitrixService.callMethod(
      'crm.address.update',
      {
        fields: {
          TYPE_ID: data.typeId,
          ENTITY_TYPE_ID: BitrixEntityType.REQUISITE,
          ENTITY_ID: data.entityId,
          ADDRESS_1: data.address1,
          ADDRESS_2: data.address2,
          CITY: data.city,
          PROVINCE: data.province,
          COUNTRY: data.country,
        },
      },
      await this.authService.getAccessToken(),
    );
  }

  async delete(data: AddressInterface) {
    await this.bitrixService.callMethod(
      'crm.address.delete',
      {
        fields: {
          TYPE_ID: data.typeId,
          ENTITY_TYPE_ID: BitrixEntityType.REQUISITE,
          ENTITY_ID: data.entityId,
        },
      },
      await this.authService.getAccessToken(),
    );
  }
}
