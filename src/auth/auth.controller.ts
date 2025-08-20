import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import express from 'express';
import { AuthDTO } from './dtos/auth.dto';

@Controller('install')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post()
  async handleInstall(
    @Body() authDTO: AuthDTO,
    @Res() res: express.Response,
  ): Promise<void> {
    const authToken = authDTO.toAuthToken();
    await this.authService.upsertAuthToken(authToken);
    res.status(200).send('Installation successful.');
  }
}
