// contact-value.dto.ts
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class ContactValue {
  @Expose({ name: 'ID' })
  @IsString()
  id: string;

  @Expose({ name: 'VALUE_TYPE' })
  @IsString()
  valueType: string;

  @Expose({ name: 'VALUE' })
  @IsString()
  value: string;

  @Expose({ name: 'TYPE_ID' })
  @IsString()
  typeId: string;
}
