import { PartialType } from '@nestjs/swagger';
import { ContactRequestDto } from './contact.request.dto';

export class ContactUpdateDto extends PartialType(ContactRequestDto) {}
