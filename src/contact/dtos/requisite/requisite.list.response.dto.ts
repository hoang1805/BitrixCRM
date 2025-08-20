// contact-list-response.dto.ts
import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { RequisiteDto } from './requisite.dto';

export class RequisiteListResponseDto {
  @Expose({ name: 'result' })
  @Type(() => RequisiteDto)
  @ValidateNested({ each: true })
  @IsArray()
  result: RequisiteDto[];
}
