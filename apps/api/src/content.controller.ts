import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Prisma, ServiceLine } from '@prisma/client';
import { Request } from 'express';
import { AdminGuard } from './auth';
import {
  CatalogQueryDto,
  CreateCategoryDto,
  CreateGalleryDto,
  CreateProductDto,
  CreatePromotionDto,
  UpdateCategoryDto,
  UpdateGalleryDto,
  UpdateProductDto,
  UpdatePromotionDto,
  UpdateSettingsDto,
} from './content.dto';
import { PrismaService } from './prisma.service';

type AdminRequest = Request & { admin: { id: string; email: string; role: string } };

@Controller()
export class ContentController {
  constructor(private readonly prisma: PrismaService) {}

  private async audit(request: AdminRequest, action: string, entityType: string, entityId: string) {
    await this.prisma.auditEvent.create({
      data: { actorId: request.admin.id, action, entityType, entityId },
    });
  }

  private promotionDates(startsAt?: string, endsAt?: string) {
    const start = startsAt ? new Date(startsAt) : undefined;
    const end = endsAt ? new Date(endsAt) : undefined;
    if (start && end && end <= start) {
      throw new BadRequestException('endsAt must be after startsAt');
    }
    return { start, end };
  }

  @Get('categories')
  categories(@Query() query: CatalogQueryDto) {
    return this.prisma.category.findMany({
      where: { isActive: true, ...(query.line ? { serviceLine: query.line } : {}) },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  @Get('products')
  products(@Query() query: CatalogQueryDto) {
    return this.prisma.product.findMany({
      where: {
        category: {
          isActive: true,
          ...(query.line ? { serviceLine: query.line } : {}),
          ...(query.category ? { slug: query.category } : {}),
        },
        ...(query.q ? { name: { contains: query.q, mode: 'insensitive' } } : {}),
      },
      include: {
        category: true,
        variants: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { name: 'asc' },
    });
  }

  @Get('gallery')
  gallery() {
    return this.prisma.galleryImage.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  @Get('promotions')
  promotions() {
    const now = new Date();
    return this.prisma.promotion.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('settings')
  async settings() {
    const settings = await this.prisma.siteSettings.findUnique({ where: { id: 'default' } });
    if (!settings) return null;
    const {
      whatsappNumber,
      businessName,
      tagline,
      phone,
      email,
      address,
      mapEmbedUrl,
      businessHours,
      socialLinks,
      heroTitle,
      heroSubtitle,
      heroImageUrl,
      heroImageAlt,
    } = settings;
    return {
      whatsappNumber,
      businessName,
      tagline,
      phone,
      email,
      address,
      mapEmbedUrl,
      businessHours,
      socialLinks,
      heroTitle,
      heroSubtitle,
      heroImageUrl,
      heroImageAlt,
    };
  }

  @UseGuards(AdminGuard)
  @Get('admin/categories')
  adminCategories() {
    return this.prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: [{ serviceLine: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  @UseGuards(AdminGuard)
  @Post('admin/categories')
  async createCategory(@Req() request: AdminRequest, @Body() dto: CreateCategoryDto) {
    const created = await this.prisma.category.create({ data: dto });
    await this.audit(request, 'CREATE', 'Category', created.id);
    return created;
  }

  @UseGuards(AdminGuard)
  @Patch('admin/categories/:id')
  async updateCategory(@Req() request: AdminRequest, @Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    const updated = await this.prisma.category.update({ where: { id }, data: dto });
    await this.audit(request, 'UPDATE', 'Category', id);
    return updated;
  }

  @UseGuards(AdminGuard)
  @Delete('admin/categories/:id')
  async deleteCategory(@Req() request: AdminRequest, @Param('id') id: string) {
    const count = await this.prisma.product.count({ where: { categoryId: id } });
    if (count) throw new ConflictException('Move or delete products before deleting this category.');
    const deleted = await this.prisma.category.delete({ where: { id } });
    await this.audit(request, 'DELETE', 'Category', id);
    return deleted;
  }

  @UseGuards(AdminGuard)
  @Get('admin/products')
  adminProducts() {
    return this.prisma.product.findMany({
      include: { category: true, variants: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { name: 'asc' },
    });
  }

  @UseGuards(AdminGuard)
  @Post('admin/products')
  async createProduct(@Req() request: AdminRequest, @Body() dto: CreateProductDto) {
    const { variants, ...data } = dto;
    const created = await this.prisma.product.create({
      data: { ...data, variants: variants ? { create: variants } : undefined },
      include: { variants: true },
    });
    await this.audit(request, 'CREATE', 'Product', created.id);
    return created;
  }

  @UseGuards(AdminGuard)
  @Patch('admin/products/:id')
  async updateProduct(@Req() request: AdminRequest, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    const { variants, ...data } = dto;
    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...(variants ? { variants: { deleteMany: {}, create: variants } } : {}),
      },
      include: { variants: true },
    });
    await this.audit(request, 'UPDATE', 'Product', id);
    return updated;
  }

  @UseGuards(AdminGuard)
  @Delete('admin/products/:id')
  async deleteProduct(@Req() request: AdminRequest, @Param('id') id: string) {
    const deleted = await this.prisma.product.delete({ where: { id } });
    await this.audit(request, 'DELETE', 'Product', id);
    return deleted;
  }

  @UseGuards(AdminGuard)
  @Get('admin/gallery')
  adminGallery() {
    return this.prisma.galleryImage.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  @UseGuards(AdminGuard)
  @Post('admin/gallery')
  async createGallery(@Req() request: AdminRequest, @Body() dto: CreateGalleryDto) {
    const created = await this.prisma.galleryImage.create({ data: dto });
    await this.audit(request, 'CREATE', 'GalleryImage', created.id);
    return created;
  }

  @UseGuards(AdminGuard)
  @Patch('admin/gallery/:id')
  async updateGallery(@Req() request: AdminRequest, @Param('id') id: string, @Body() dto: UpdateGalleryDto) {
    const updated = await this.prisma.galleryImage.update({ where: { id }, data: dto });
    await this.audit(request, 'UPDATE', 'GalleryImage', id);
    return updated;
  }

  @UseGuards(AdminGuard)
  @Delete('admin/gallery/:id')
  async deleteGallery(@Req() request: AdminRequest, @Param('id') id: string) {
    const deleted = await this.prisma.galleryImage.delete({ where: { id } });
    await this.audit(request, 'DELETE', 'GalleryImage', id);
    return deleted;
  }

  @UseGuards(AdminGuard)
  @Get('admin/promotions')
  adminPromotions() {
    return this.prisma.promotion.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @UseGuards(AdminGuard)
  @Post('admin/promotions')
  async createPromotion(@Req() request: AdminRequest, @Body() dto: CreatePromotionDto) {
    const { startsAt, endsAt, ...data } = dto;
    const { start, end } = this.promotionDates(startsAt, endsAt);
    const created = await this.prisma.promotion.create({
      data: { ...data, startsAt: start, endsAt: end },
    });
    await this.audit(request, 'CREATE', 'Promotion', created.id);
    return created;
  }

  @UseGuards(AdminGuard)
  @Patch('admin/promotions/:id')
  async updatePromotion(@Req() request: AdminRequest, @Param('id') id: string, @Body() dto: UpdatePromotionDto) {
    const { startsAt, endsAt, ...data } = dto;
    const current = await this.prisma.promotion.findUniqueOrThrow({ where: { id } });
    const { start, end } = this.promotionDates(
      startsAt ?? current.startsAt?.toISOString(),
      endsAt ?? current.endsAt?.toISOString(),
    );
    const updated = await this.prisma.promotion.update({
      where: { id },
      data: { ...data, startsAt: start, endsAt: end },
    });
    await this.audit(request, 'UPDATE', 'Promotion', id);
    return updated;
  }

  @UseGuards(AdminGuard)
  @Delete('admin/promotions/:id')
  async deletePromotion(@Req() request: AdminRequest, @Param('id') id: string) {
    const deleted = await this.prisma.promotion.delete({ where: { id } });
    await this.audit(request, 'DELETE', 'Promotion', id);
    return deleted;
  }

  @UseGuards(AdminGuard)
  @Patch('admin/settings')
  async updateSettings(@Req() request: AdminRequest, @Body() dto: UpdateSettingsDto) {
    const current = await this.prisma.siteSettings.findUnique({ where: { id: 'default' } });
    if (!current && !dto.whatsappNumber) {
      throw new BadRequestException('whatsappNumber is required when creating settings.');
    }
    const data = {
      ...dto,
      businessHours: dto.businessHours as Prisma.InputJsonValue | undefined,
      socialLinks: dto.socialLinks as Prisma.InputJsonValue | undefined,
    };
    const updated = await this.prisma.siteSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', whatsappNumber: dto.whatsappNumber!, ...data },
      update: data,
    });
    await this.audit(request, current ? 'UPDATE' : 'CREATE', 'SiteSettings', 'default');
    return updated;
  }
}
