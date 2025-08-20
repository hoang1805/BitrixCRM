import { HttpStatus, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuthService } from 'src/auth/auth.service';
import { CustomError } from 'src/common/errors/custom.error';
import {
  BitrixEntityType,
  BitrixService,
  RequisiteTemplate,
} from 'src/common/services/bitrix.service';
import { ArrayUtil } from 'src/common/utils/array.util';
import { ContactRequestDto } from 'src/contact/dtos/contact/contact.request.dto';
import { ContactUpdateDto } from 'src/contact/dtos/contact/contact.update.dto';
import { RequisiteDto } from 'src/contact/dtos/requisite/requisite.dto';
import { RequisiteListResponseDto } from 'src/contact/dtos/requisite/requisite.list.response.dto';

@Injectable()
export class RequisiteService {
  constructor(
    private readonly bitrixService: BitrixService,
    private readonly authService: AuthService,
  ) {}

  async getByContacts(contactIds: string[]): Promise<RequisiteDto[]> {
    const rawData = await this.bitrixService.callMethod(
      'crm.requisite.list',
      {
        filter: {
          ENTITY_TYPE_ID: BitrixEntityType.CONTACT,
          '@ENTITY_ID': contactIds,
        },
      },
      await this.authService.getAccessToken(),
    );

    const response = plainToInstance(RequisiteListResponseDto, rawData, {
      excludeExtraneousValues: true,
    });

    return response.result || [];
  }

  async createByContact(
    contactId: string,
    contactDto: ContactUpdateDto,
  ): Promise<number> {
    const response: any = await this.bitrixService.callMethod(
      'crm.requisite.add',
      {
        fields: {
          ENTITY_TYPE_ID: BitrixEntityType.CONTACT,
          ENTITY_ID: contactId,
          PRESET_ID: RequisiteTemplate.INDIVIDUAL,
          NAME: ArrayUtil.toString(
            [contactDto.lastName ?? '', contactDto.firstName],
            ' ',
          ),
        },
      },
      await this.authService.getAccessToken(),
    );

    const requisiteId = response?.result;
    if (!requisiteId) {
      throw new CustomError(
        'Cannot create requisite',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return requisiteId as number;
  }

  async deleteById(id: string) {
    await this.bitrixService.callMethod(
      'crm.requisite.add',
      {
        id: id,
      },
      await this.authService.getAccessToken(),
    );
  }
}
