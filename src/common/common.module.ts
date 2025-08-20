import { Global, Module } from '@nestjs/common';
import { RequestService } from './services/request.service';
import { HttpModule } from '@nestjs/axios';
import { BitrixService } from './services/bitrix.service';
import { LogService } from './services/log.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [RequestService, BitrixService, LogService],
  exports: [RequestService, BitrixService, LogService],
})
export class CommonModule {}
