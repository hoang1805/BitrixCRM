import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './services/contact/contact.service';
import { AuthModule } from 'src/auth/auth.module';
import { AddressService } from './services/address/address.service';
import { RequisiteService } from './services/requisite/requisite.service';
import { BankService } from './services/bank/bank.service';

@Module({
  imports: [AuthModule],
  controllers: [ContactController],
  providers: [ContactService, AddressService, RequisiteService, BankService],
  exports: [ContactService, AddressService, RequisiteService, BankService],
})
export class ContactModule {}
