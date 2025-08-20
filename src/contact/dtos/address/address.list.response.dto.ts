// contact-list-response.dto.ts
import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { AddressDto } from './address.dto';

export class AddressListResponseDto {
  @Expose({ name: 'result' })
  @Type(() => AddressDto)
  @ValidateNested({ each: true })
  @IsArray()
  result: AddressDto[];
}
