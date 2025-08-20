/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';
import { CustomError } from '../errors/custom.error';

@Injectable()
export class RequestService {
  constructor(private readonly httpService: HttpService) {}

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this._makeRequest<T>({ ...config, method: 'GET', url });
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return this._makeRequest<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return this._makeRequest<T>({ ...config, method: 'PUT', url, data });
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this._makeRequest<T>({ ...config, method: 'DELETE', url });
  }

  private async _makeRequest<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.httpService.request<T>(config),
      );
      return response.data;
    } catch (err: any) {
      console.log(err);
      if (axios.isAxiosError(err)) {
        const status = err.response?.status || 500;
        const message: string =
          err.response?.data.error_description ||
          err.response?.data.error ||
          err.message ||
          'An error occurred while making the request.';

        throw new CustomError(message, status);
      } else {
        throw new CustomError(
          err?.message ||
            'An unexpected error occurred while making the request.',
          500,
        );
      }
    }
  }
}
