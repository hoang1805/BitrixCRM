import { HttpStatus, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuthService } from 'src/auth/auth.service';
import { CustomError } from 'src/common/errors/custom.error';
import { BitrixService } from 'src/common/services/bitrix.service';
import { BankDto } from 'src/contact/dtos/bank/bank.dto';
import { BankListResponseDto } from 'src/contact/dtos/bank/bank.list.response.dto';
import { ContactDto } from 'src/contact/dtos/contact/contact.dto';
import { ContactRequestDto } from 'src/contact/dtos/contact/contact.request.dto';
import { BankInterface } from 'src/contact/interfaces/bank.interface';

@Injectable()
export class BankService {
  constructor(
    private readonly bitrixService: BitrixService,
    private readonly authService: AuthService,
  ) {}

  async getByRequistes(requisiteIds: string[]): Promise<BankDto[]> {
    const rawData = await this.bitrixService.callMethod(
      'crm.requisite.bankdetail.list',
      {
        filter: {
          '@ENTITY_ID': requisiteIds,
        },
      },
      await this.authService.getAccessToken(),
    );

    const response = plainToInstance(BankListResponseDto, rawData, {
      excludeExtraneousValues: true,
    });

    return response.result || [];
  }

  async createByRequiste(
    requisiteId: number,
    contactDto: ContactRequestDto,
  ): Promise<number[]> {
    const bankIds: number[] = [];
    const banks = contactDto.bank || [];
    for (let i = 0; i < banks.length; i++) {
      const bank = banks[i];
      if (!bank.name || !bank.accountNumber) {
        throw new CustomError(
          `Missing name or accountNumber at index ${i}.`,
          HttpStatus.BAD_REQUEST,
        );
      }
      const id = await this.create(requisiteId, bank.name, bank.accountNumber);
      bankIds.push(id);
    }

    return bankIds;
  }

  async massUpdate(
    requisiteId: number | string,
    contactDto: ContactRequestDto,
  ) {
    const banks = contactDto.bank || [];

    for (let i = 0; i < banks.length; i++) {
      const bank = banks[i];

      if (bank.deleted) {
        if (!bank.id) {
          throw new CustomError(
            `Cannot delete at index ${i} without an ID.`,
            HttpStatus.BAD_REQUEST,
          );
        }
        await this.delete(bank.id);
        continue;
      }

      if (!bank.name || !bank.accountNumber) {
        throw new CustomError(
          `Missing name or accountNumber at index ${i}.`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (bank.id) {
        await this.update(bank.id, bank.name, bank.accountNumber);
      } else {
        await this.create(requisiteId, bank.name, bank.accountNumber);
      }
    }
  }

  async create(
    requisiteId: number | string,
    bank: string,
    accountNumber: string,
  ): Promise<number> {
    const response: any = await this.bitrixService.callMethod(
      'crm.requisite.bankdetail.add',
      {
        fields: {
          ENTITY_ID: requisiteId,
          NAME: bank,
          RQ_BANK_NAME: bank,
          RQ_ACC_NUM: accountNumber,
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

    return result as number;
  }

  async update(id: number | string, bank: string, accountNumber: string) {
    await this.bitrixService.callMethod(
      'crm.requisite.bankdetail.add',
      {
        id: id,
        fields: {
          NAME: bank,
          RQ_BANK_NAME: bank,
          RQ_ACC_NUM: accountNumber,
        },
      },
      await this.authService.getAccessToken(),
    );
  }

  async delete(id: number | string) {
    await this.bitrixService.callMethod(
      'crm.requisite.bankdetail.delete',
      {
        id: id,
      },
      await this.authService.getAccessToken(),
    );
  }
}
