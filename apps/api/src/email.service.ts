import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(private readonly config: ConfigService) {}

  async send(to: string, subject: string, html: string) {
    const key = this.config.get<string>('RESEND_API_KEY');
    if (!key) return { sent: false, reason: 'Email provider is not configured.' };
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: this.config.get<string>('RESEND_FROM_EMAIL') ?? 'De Big Tank <onboarding@resend.dev>', to, subject, html }),
    });
    if (!response.ok) throw new ServiceUnavailableException('Email delivery failed. Check the Resend configuration.');
    return { sent: true };
  }
}
