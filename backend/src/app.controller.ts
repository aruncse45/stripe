import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  type RawBodyRequest,
} from '@nestjs/common';
import type { Request } from 'express';
import { AppService } from './app.service.js';
import type { Item } from './items.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('items')
  getItems(): Item[] {
    return this.appService.getItems();
  }

  @Post('checkout')
  async checkout(
    @Body() body: { itemId: string; quantity: number },
  ): Promise<{ url: string }> {
    const url = await this.appService.createCheckoutSession(
      body?.itemId,
      body?.quantity,
    );
    return { url };
  }

  @Post('webhook')
  handleWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string | undefined,
  ): { received: boolean } {
    this.appService.handleWebhook(request.rawBody, signature);
    return { received: true };
  }
}
