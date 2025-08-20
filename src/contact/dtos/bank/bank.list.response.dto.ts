import { Expose, Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';
import { BankDto } from './bank.dto';

export class BankListResponseDto {
  @Expose({ name: 'result' })
  @Type(() => BankDto)
  @ValidateNested({ each: true })
  @IsArray()
  result: BankDto[];
}
