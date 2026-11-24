import { BadRequestException, Body, ConflictException, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from './auth';
import { EmailService } from './email.service';
import { PrismaService } from './prisma.service';
import { AnnouncementDto, CreateSubscriberDto } from './subscriber.dto';

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);

@Controller()
export class SubscribersController {
  constructor(private readonly prisma: PrismaService, private readonly email: EmailService) {}

  @Post('subscribers')
  async subscribe(@Body() dto: CreateSubscriberDto) {
    if (!dto.consent) throw new BadRequestException('Please agree to receive event updates.');
    const digits = dto.whatsappNumber?.replace(/\D/g, '');
    const normalized = digits ? (digits.startsWith('234') ? digits : digits.startsWith('0') ? `234${digits.slice(1)}` : `234${digits}`) : null;
    try {
      const subscriber = await this.prisma.subscriber.create({ data: { firstName: dto.firstName.trim(), email: dto.email.trim().toLowerCase(), whatsappNumber: normalized, whatsappOptedIn: false } });
      const name = escapeHtml(subscriber.firstName);
      const html = `<p>Hi ${name},</p><p>You are now on the De Big Tank insider list.</p><p>You will hear about game nights, karaoke evenings, special events and offers before anyone else.</p><p>See you soon.</p><p>De Big Tank<br>Km 1 Ugbomro Road, Warri · 07037236666</p>`;
      let emailSent = false;
      try { emailSent = (await this.email.send(subscriber.email, 'You are on the De Big Tank list', html)).sent; } catch { /* Signup is retained for admin retry/announcement. */ }
      return { success: true, emailSent, subscriber: { id: subscriber.id, firstName: subscriber.firstName, whatsappNumber: subscriber.whatsappNumber } };
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') throw new ConflictException('This email is already on the list.');
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Get('admin/subscribers')
  async list() {
    const [total, subscribers] = await Promise.all([
      this.prisma.subscriber.count(),
      this.prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } }),
    ]);
    return { total, subscribers };
  }

  @UseGuards(AdminGuard)
  @Get('admin/subscribers/export')
  async exportSubscribers() {
    const subscribers = await this.prisma.subscriber.findMany({ where: { isActive: true, whatsappNumber: { not: null } }, orderBy: { createdAt: 'desc' }, select: { firstName: true, email: true, whatsappNumber: true, createdAt: true, isActive: true } });
    return subscribers;
  }

  @UseGuards(AdminGuard)
  @Patch('admin/subscribers/:id')
  async update(@Param('id') id: string, @Body() body: { isActive?: boolean }) {
    if (typeof body.isActive !== 'boolean') throw new BadRequestException('isActive must be a boolean.');
    return this.prisma.subscriber.update({ where: { id }, data: { isActive: body.isActive } });
  }

  @UseGuards(AdminGuard)
  @Post('admin/announcements')
  async announce(@Body() dto: AnnouncementDto) {
    const subscribers = await this.prisma.subscriber.findMany({ where: { isActive: true, ...(dto.audience === 'whatsapp' ? { whatsappNumber: { not: null } } : {}) }, select: { email: true, whatsappNumber: true } });
    if (dto.preview) return { preview: true, recipients: subscribers.length, subject: dto.subject, message: dto.message };
    if (dto.audience === 'whatsapp') return { sent: 0, manualStep: true, recipients: subscribers.length, whatsappNumbers: subscribers.map((subscriber) => subscriber.whatsappNumber) };
    let sent = 0;
    for (const subscriber of subscribers) {
      if ((await this.email.send(subscriber.email, dto.subject, `<p>${escapeHtml(dto.message).replace(/\n/g, '<br>')}</p>`)).sent) sent += 1;
    }
    return { sent, recipients: subscribers.length };
  }
}
