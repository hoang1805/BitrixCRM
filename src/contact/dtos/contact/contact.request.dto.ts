import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsNumberString,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  ValidateNested,
} from 'class-validator';
import { BitrixAddressType } from 'src/common/services/bitrix.service';
import { UniqueByField } from 'src/common/validators/unique.by.field.validator';
import { MultifieldRequest } from 'src/contact/interfaces/multifield.request.interface';

export class ContactRequestDto {
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @Type(() => PhoneRequestDto)
  @ValidateNested({ each: true })
  @IsArray()
  phone?: PhoneRequestDto[];

  @IsOptional()
  @Type(() => EmailRequestDto)
  @ValidateNested({ each: true })
  @IsArray()
  email?: EmailRequestDto[];

  @IsOptional()
  @Type(() => WebsiteRequestDto)
  @ValidateNested({ each: true })
  @IsArray()
  website?: WebsiteRequestDto[];

  @IsOptional()
  @Type(() => AddressRequestDto)
  @ValidateNested({ each: true })
  @IsArray()
  @UniqueByField<AddressRequestDto>('typeId')
  address?: AddressRequestDto[];

  @IsOptional()
  @Type(() => BankRequestDto)
  @ValidateNested({ each: true })
  @IsArray()
  bank?: BankRequestDto[];
}

class PhoneRequestDto implements MultifieldRequest {
  @IsOptional()
  @Type(() => String)
  @IsNumberString()
  id?: string;

  @IsOptional()
  @IsString()
  @IsIn(['WORK', 'MOBILE', 'FAX', 'HOME', 'PAGER', 'MAILING', 'OTHER'])
  type?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+\d+$/, {
    message: 'Phone number must start with + and contain only digits after',
  })
  value?: string;

  @Transform(({ value }) => {
    if (value === undefined || value === null) return false;
    return value === 'true' || value === true;
  })
  @IsBoolean()
  deleted: boolean = false;
}

class EmailRequestDto implements MultifieldRequest {
  @IsOptional()
  @Type(() => String)
  @IsNumberString()
  id?: string;

  @IsOptional()
  @IsString()
  @IsIn(['WORK', 'HOME', 'MAILING', 'OTHER'])
  type?: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  value?: string;

  @Transform(({ value }) => {
    if (value === undefined || value === null) return false;
    return value === 'true' || value === true;
  })
  @IsBoolean()
  deleted: boolean = false;
}

class WebsiteRequestDto implements MultifieldRequest {
  @IsOptional()
  @Type(() => String)
  @IsNumberString()
  id?: string;

  @IsOptional()
  @IsString()
  @IsIn(['WORK', 'HOME', 'FACEBOOK', 'VK', 'LIVEJOURNAL', 'TWITTER', 'OTHER'])
  type?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  value?: string;

  @Transform(({ value }) => {
    if (value === undefined || value === null) return false;
    return value === 'true' || value === true;
  })
  @IsBoolean()
  deleted: boolean = false;
}

export class AddressRequestDto {
  @Type(() => Number)
  @IsEnum(BitrixAddressType)
  typeId: BitrixAddressType;

  @IsOptional()
  @Type(() => String)
  @IsNumberString()
  entityId?: string;

  @IsOptional()
  @IsString()
  address1?: string;

  @IsOptional()
  @IsString()
  address2?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @Transform(({ value }) => {
    if (value === undefined || value === null) return false;
    return value === 'true' || value === true;
  })
  @IsBoolean()
  deleted: boolean = false;
}

class BankRequestDto {
  @IsOptional()
  @Type(() => String)
  @IsNumberString()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => String)
  @IsNumberString()
  accountNumber?: string;

  @Transform(({ value }) => {
    if (value === undefined || value === null) return false;
    return value === 'true' || value === true;
  })
  @IsBoolean()
  deleted: boolean = false;
}
