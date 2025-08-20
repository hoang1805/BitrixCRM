import { Expose } from 'class-transformer';

export class BankDto {
  @Expose({ name: 'ID' })
  id: string;

  @Expose({ name: 'ENTITY_ID' })
  entityId: string;

  @Expose({ name: 'RQ_BANK_NAME' })
  name: string;

  @Expose({ name: 'RQ_ACC_NUM' })
  accountNumber: string;
}
