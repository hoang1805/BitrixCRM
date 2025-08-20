import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { ContactService } from './services/contact/contact.service';
import { AddressService } from './services/address/address.service';
import { RequisiteService } from './services/requisite/requisite.service';
import { ArrayUtil } from 'src/common/utils/array.util';
import { BankService } from './services/bank/bank.service';
import express from 'express';
import { ContactRequestDto } from './dtos/contact/contact.request.dto';

@Controller('contacts')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly addressService: AddressService,
    private readonly requisiteService: RequisiteService,
    private readonly bankService: BankService,
  ) {}
  @Get()
  async getAllContacts(@Res() res: express.Response) {
    // Logic to handle getting contacts
    const contacts = await this.contactService.getContacts();
    const contactIds = ArrayUtil.extract(contacts, 'id');

    const requisites = await this.requisiteService.getByContacts(contactIds);
    const requisiteIds = ArrayUtil.extract(requisites, 'id');

    const addresses = await this.addressService.getByRequisites(requisiteIds);

    const banks = await this.bankService.getByRequistes(requisiteIds);

    const contactDetails = this.contactService.getAllContactDetails(
      contacts,
      requisites,
      addresses,
      banks,
    );

    return res.status(200).json(contactDetails);
  }

  @Post()
  async createContact(@Body() contactDto: ContactRequestDto) {
    // Logic to handle creating a contact
    const contactId = await this.contactService.createContact(contactDto);
    const requisiteId = await this.requisiteService.createByContact(
      contactId.toString(),
      contactDto,
    );

    await this.addressService.createByRequisite(requisiteId, contactDto);

    const bankIds = await this.bankService.createByRequiste(
      requisiteId,
      contactDto,
    );

    return { contactId, requisiteId, bankIds };
  }

  @Put(':id')
  async updateContact(
    @Param('id') id: number,
    @Body() contactDto: ContactRequestDto,
  ) {
    // Logic to handle updating a contact
    await this.contactService.updateContact(id.toString(), contactDto);

    const requisites = await this.requisiteService.getByContacts([
      id.toString(),
    ]);
    let requisiteId: number | string | null = null;
    if (!requisites.length) {
      requisiteId = await this.requisiteService.createByContact(
        id.toString(),
        contactDto,
      );
    } else {
      requisiteId = requisites[0].id;
    }

    await this.bankService.massUpdate(requisiteId, contactDto);
    await this.addressService.massUpdate(requisiteId, contactDto);
  }

  @Delete(':id')
  async deleteContact(@Param('id') id: number) {
    await this.contactService.deleteById(id);
    const requisites = await this.requisiteService.getByContacts([
      id.toString(),
    ]);

    for (let i = 0; i < requisites.length; i++) {
      await this.requisiteService.deleteById(requisites[i].id);
    }
  }
}
