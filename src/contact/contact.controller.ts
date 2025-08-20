import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
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
import { ContactUpdateDto } from './dtos/contact/contact.update.dto';

@Controller('contacts')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly addressService: AddressService,
    private readonly requisiteService: RequisiteService,
    private readonly bankService: BankService,
  ) {}

  // GET /contacts - Retrieve all contacts with their details
  @Get()
  async getAllContacts(@Res() res: express.Response) {
    // Fetch all contacts
    const contacts = await this.contactService.getContacts();
    // Extract contact IDs
    const contactIds = ArrayUtil.extract(contacts, 'id');
    // Fetch requisites for these contacts
    const requisites = await this.requisiteService.getByContacts(contactIds);
    // Extract requisite IDs
    const requisiteIds = ArrayUtil.extract(requisites, 'id');
    // Fetch addresses and banks linked to requisites
    const addresses = await this.addressService.getByRequisites(requisiteIds);
    const banks = await this.bankService.getByRequistes(requisiteIds);
    // Aggregate all details into a single response
    const contactDetails = this.contactService.getAllContactDetails(
      contacts,
      requisites,
      addresses,
      banks,
    );
    // Return the aggregated contact details
    return res.status(HttpStatus.OK).json(contactDetails);
  }

  // POST /contacts - Create a new contact
  @Post()
  async createContact(
    @Body() contactDto: ContactRequestDto,
    @Res() res: express.Response,
  ) {
    // Create the contact and get its ID
    const contactId = await this.contactService.createContact(contactDto);
    // Create a requisite for the contact
    const requisiteId = await this.requisiteService.createByContact(
      contactId.toString(),
      contactDto,
    );
    // Create address and bank records linked to the requisite
    await this.addressService.createByRequisite(requisiteId, contactDto);
    const bankIds = await this.bankService.createByRequiste(
      requisiteId,
      contactDto,
    );
    // Return the new contact ID
    return res.status(HttpStatus.OK).json({ contactId });
  }

  // PUT /contacts/:id - Update an existing contact
  @Put(':id')
  async updateContact(
    @Param('id') id: number,
    @Body() contactDto: ContactUpdateDto,
    @Res() res: express.Response,
  ) {
    // Update the contact's main info
    await this.contactService.updateContact(id.toString(), contactDto);
    // Fetch requisites for the contact
    const requisites = await this.requisiteService.getByContacts([
      id.toString(),
    ]);
    let requisiteId: number | string | null = null;
    // If no requisite exists, create one
    if (!requisites.length) {
      requisiteId = await this.requisiteService.createByContact(
        id.toString(),
        contactDto,
      );
    } else {
      // Otherwise, use the existing requisite ID
      requisiteId = requisites[0].id;
    }
    // Update bank and address info linked to the requisite
    await this.bankService.massUpdate(requisiteId, contactDto);
    await this.addressService.massUpdate(requisiteId, contactDto);
    // Return success message
    return res
      .status(HttpStatus.OK)
      .json({ message: 'Update successfully !!!' });
  }

  // DELETE /contacts/:id - Delete a contact and its requisites
  @Delete(':id')
  async deleteContact(@Param('id') id: number, @Res() res: express.Response) {
    // Delete the contact
    await this.contactService.deleteById(id);
    // Fetch requisites linked to the contact
    const requisites = await this.requisiteService.getByContacts([
      id.toString(),
    ]);
    // Delete each requisite
    for (let i = 0; i < requisites.length; i++) {
      await this.requisiteService.deleteById(requisites[i].id);
    }
    // Return success message
    return res
      .status(HttpStatus.OK)
      .json({ message: 'Delete successfully !!!' });
  }
}
