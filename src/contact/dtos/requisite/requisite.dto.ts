import { Expose } from 'class-transformer';

export class RequisiteDto {
  @Expose({ name: 'ID' })
  id: string;

  @Expose({ name: 'ENTITY_TYPE_ID' })
  entityTypeId: string;

  @Expose({ name: 'ENTITY_ID' })
  entityId: string;

  @Expose({ name: 'PRESET_ID' })
  presetId: string;

  @Expose({ name: 'NAME' })
  name: string;
}
