// contact.dto.ts
import { Expose, Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ContactValue } from './contact.value.dto';

export class ContactDto {
  @Expose({ name: 'ID' })
  @IsString()
  id: string;

  @Expose({ name: 'NAME' })
  @IsString()
  name: string;

  @Expose({ name: 'SECOND_NAME' })
  @IsOptional()
  @IsString()
  secondName?: string;

  @Expose({ name: 'LAST_NAME' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @Expose({ name: 'PHONE' })
  @IsOptional()
  @Type(() => ContactValue)
  @ValidateNested({ each: true })
  @IsArray()
  phone?: ContactValue[];

  @Expose({ name: 'EMAIL' })
  @IsOptional()
  @Type(() => ContactValue)
  @ValidateNested({ each: true })
  @IsArray()
  email?: ContactValue[];

  @Expose({ name: 'WEB' })
  @IsOptional()
  @Type(() => ContactValue)
  @ValidateNested({ each: true })
  @IsArray()
  web?: ContactValue[];
}
