import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { findItem, items, type Item } from './items.js';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly stripe: Stripe;

  constructor(private readonly config: ConfigService) {
    this.stripe = new Stripe(
      this.config.get<string>('STRIPE_SECRET_KEY') ?? '',
    );
  }

  getItems(): Item[] {
    return items;
  }

  async createCheckoutSession(
    itemId: string,
    quantity: number,
  ): Promise<string> {
    const item = findItem(itemId);

    if (!item) {
      throw new BadRequestException(`Unknown itemId: ${itemId}`);
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new BadRequestException(
        'Quantity must be a whole number of at least 1',
      );
    }

    const frontendUrl = this.config.get<string>('FRONTEND_URL');

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity,
          price_data: {
            currency: item.currency,
            unit_amount: item.price,
            product_data: { name: item.name },
          },
        },
      ],
      success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/cancel`,
    });

    if (!session.url) {
      throw new InternalServerErrorException(
        'Stripe did not return a checkout url',
      );
    }

    return session.url;
  }

  handleWebhook(
    rawBody: Buffer | undefined,
    signature: string | undefined,
  ): void {
    if (!rawBody || !signature) {
      throw new BadRequestException(
        'Missing raw body or stripe-signature header',
      );
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.config.get<string>('STRIPE_WEBHOOK_SECRET') ?? '',
      );
    } catch (error) {
      throw new BadRequestException(
        `Webhook signature verification failed: ${(error as Error).message}`,
      );
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      this.logger.log(
        `checkout.session.completed id=${session.id} amount_total=${session.amount_total} currency=${session.currency}`,
      );
    }
  }
}
