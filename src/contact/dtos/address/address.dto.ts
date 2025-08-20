import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class AddressDto {
  @Expose({ name: 'TYPE_ID' })
  typeId: string;

  @Expose({ name: 'ENTITY_TYPE_ID' })
  entityTypeId: string;

  @Expose({ name: 'ENTITY_ID' })
  entityId: string;

  @Expose({ name: 'ADDRESS_1' })
  @IsOptional()
  address1?: string;

  @Expose({ name: 'ADDRESS_2' })
  @IsOptional()
  address2?: string;

  @Expose({ name: 'CITY' })
  @IsOptional()
  city?: string;

  @Expose({ name: 'POSTAL_CODE' })
  @IsOptional()
  postalCode?: string;

  @Expose({ name: 'REGION' })
  @IsOptional()
  region?: string;

  @Expose({ name: 'PROVINCE' })
  @IsOptional()
  province?: string;

  @Expose({ name: 'COUNTRY' })
  @IsOptional()
  country?: string;

  @Expose({ name: 'COUNTRY_CODE' })
  @IsOptional()
  countryCode?: string;

  @Expose({ name: 'LOC_ADDR_ID' })
  @IsOptional()
  locAddrId?: string;

  @Expose({ name: 'ANCHOR_TYPE_ID' })
  @IsOptional()
  anchorTypeId?: string;

  @Expose({ name: 'ANCHOR_ID' })
  @IsOptional()
  anchorId?: string;
}
