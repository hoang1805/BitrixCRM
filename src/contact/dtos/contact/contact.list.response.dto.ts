// contact-list-response.dto.ts
import { Expose, Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { ContactDto } from './contact.dto';

export class ContactListResponseDto {
  @Expose({ name: 'result' })
  @Type(() => ContactDto)
  @ValidateNested({ each: true })
  @IsArray()
  result: ContactDto[];

  @Expose()
  @IsNumber()
  total: number;
}
