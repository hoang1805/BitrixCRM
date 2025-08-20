import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestService } from 'src/common/services/request.service';
import { BitrixTokenResponse } from './interfaces/bitrix.token.response';
import { AuthToken } from './interfaces/auth.token';
import { Repository } from 'typeorm';
import { Token } from './entities/token';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly requestService: RequestService,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  async upsertAuthToken(authToken: AuthToken): Promise<Token> {
    const existingToken = await this.isExist(authToken.memberId);
    const expiresAt = Date.now() + authToken.expiresIn * 1000; // Convert seconds to milliseconds
    let token: Token;
    if (existingToken) {
      token = await this.getTokenByMemberId(authToken.memberId);
      token.accessToken = authToken.accessToken;
      token.refreshToken = authToken.refreshToken;
      token.expiresAt = expiresAt;
      token.updatedAt = Date.now();
    } else {
      token = this.tokenRepository.create({
        memberId: authToken.memberId,
        accessToken: authToken.accessToken,
        refreshToken: authToken.refreshToken,
        expiresAt: expiresAt,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return await this.tokenRepository.save(token);
  }

  async isExist(memberId: string): Promise<boolean> {
    const count = await this.tokenRepository.count({
      where: { memberId },
    });
    return count > 0;
  }

  async getTokenByMemberId(memberId: string): Promise<Token> {
    const token = await this.tokenRepository.findOne({
      where: { memberId },
    });

    if (!token) {
      throw new Error(`Token for memberId ${memberId} not found`);
    }

    return token;
  }

  async getAccessToken(): Promise<string> {
    if (!(await this._isValidAccessToken())) {
      await this._refreshToken();
    }

    const token = await this.tokenRepository.findOneBy({ id: 1 });
    return token?.accessToken ?? '';
  }

  async _isValidAccessToken(): Promise<boolean> {
    const token = await this.tokenRepository.findOneBy({ id: 1 });

    if (!token) {
      return false;
    }

    const currentTime = Date.now();
    return currentTime < token.expiresAt - 60000; // 1 minute before expiration
  }

  async _refreshToken(): Promise<void> {
    const token = await this.tokenRepository.findOneBy({ id: 1 });

    if (!token) {
      throw new Error('Token not found');
    }

    const authToken = await this._getByRefreshToken(token.refreshToken);

    token.accessToken = authToken.accessToken;
    token.refreshToken = authToken.refreshToken;
    token.expiresAt = Date.now() + authToken.expiresIn * 1000; // Convert seconds to milliseconds
    token.updatedAt = Date.now();

    await this.tokenRepository.save(token);
  }

  async _getByRefreshToken(refreshToken: string): Promise<AuthToken> {
    const clientId = this.configService.get<string>('CLIENT_ID');
    const clientSecret = this.configService.get<string>('CLIENT_SECRET');
    const bitrixOauthDomain = this.configService.get<string>(
      'BITRIX_OAUTH_DOMAIN',
    );

    const response: BitrixTokenResponse = await this.requestService.get(
      `https://${bitrixOauthDomain}/oauth/token`,
      {
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        },
      },
    );

    return {
      accessToken: response.access_token,
      expiresIn: response.expires_in,
      refreshToken: response.refresh_token,
      memberId: response.member_id,
    };
  }
}
