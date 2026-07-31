import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUrl, Min, MinLength } from 'class-validator';
import { Prisma, ServiceLine } from '@prisma/client';
import { AdminGuard } from './auth';
import { PrismaService } from './prisma.service';

class CategoryDto {
  @IsString() @MinLength(2) name!: string;
  @IsString() @MinLength(2) slug!: string;
  @IsEnum(ServiceLine) serviceLine!: ServiceLine;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
class VariantDto {
  @IsString() name!: string;
  priceDelta!: number;
  @IsOptional() @IsBoolean() isAvailable?: boolean;
  @IsOptional() @IsInt() sortOrder?: number;
}
class ProductDto {
  @IsString() name!: string;
  @IsString() slug!: string;
  @IsString() description!: string;
  price!: number;
  @IsString() categoryId!: string;
  @IsOptional() @IsUrl() imageUrl?: string;
  @IsOptional() @IsString() altText?: string;
  @IsOptional() @IsBoolean() isAvailable?: boolean;
  @IsOptional() @IsBoolean() allowsSpecialNotes?: boolean;
  @IsOptional() @IsArray() variants?: VariantDto[];
}
class GalleryDto { @IsUrl() imageUrl!: string; @IsString() altText!: string; @IsOptional() @IsString() caption?: string; @IsOptional() @IsInt() sortOrder?: number; @IsOptional() @IsBoolean() isActive?: boolean; }
class PromotionDto { @IsString() title!: string; @IsString() slug!: string; @IsString() description!: string; @IsOptional() @IsUrl() imageUrl?: string; @IsOptional() @IsString() startsAt?: string; @IsOptional() @IsString() endsAt?: string; @IsOptional() @IsBoolean() isActive?: boolean; }
class SettingsDto { @IsString() whatsappNumber!: string; @IsOptional() @IsString() businessName?: string; @IsOptional() @IsString() tagline?: string; @IsOptional() @IsString() phone?: string; @IsOptional() @IsString() email?: string; @IsOptional() @IsString() address?: string; @IsOptional() @IsUrl() mapEmbedUrl?: string; @IsOptional() businessHours?: Prisma.InputJsonValue; @IsOptional() socialLinks?: Prisma.InputJsonValue; @IsOptional() @IsString() heroTitle?: string; @IsOptional() @IsString() heroSubtitle?: string; @IsOptional() @IsUrl() heroImageUrl?: string; @IsOptional() @IsString() heroImageAlt?: string; }

@Controller()
export class ContentController {
  constructor(private readonly prisma: PrismaService) {}
  @Get('categories') categories(@Query('line') line?: ServiceLine) { return this.prisma.category.findMany({ where: { isActive: true, ...(line ? { serviceLine: line } : {}) }, orderBy: { sortOrder: 'asc' } }); }
  @Get('products') products(@Query('line') line?: ServiceLine, @Query('q') q?: string) { return this.prisma.product.findMany({ where: { isAvailable: true, category: { isActive: true, ...(line ? { serviceLine: line } : {}) }, ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}) }, include: { category: true, variants: { where: { isAvailable: true }, orderBy: { sortOrder: 'asc' } } }, orderBy: { name: 'asc' } }); }
  @Get('gallery') gallery() { return this.prisma.galleryImage.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }); }
  @Get('promotions') promotions() { return this.prisma.promotion.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } }); }
  @Get('settings') settings() { return this.prisma.siteSettings.findUnique({ where: { id: 'default' } }); }

  @UseGuards(AdminGuard) @Get('admin/categories') adminCategories() { return this.prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { sortOrder: 'asc' } }); }
  @UseGuards(AdminGuard) @Post('admin/categories') createCategory(@Body() dto: CategoryDto) { return this.prisma.category.create({ data: dto }); }
  @UseGuards(AdminGuard) @Patch('admin/categories/:id') updateCategory(@Param('id') id: string, @Body() dto: Partial<CategoryDto>) { return this.prisma.category.update({ where: { id }, data: dto }); }
  @UseGuards(AdminGuard) @Delete('admin/categories/:id') deleteCategory(@Param('id') id: string) { return this.prisma.category.delete({ where: { id } }); }

  @UseGuards(AdminGuard) @Get('admin/products') adminProducts() { return this.prisma.product.findMany({ include: { category: true, variants: true } }); }
  @UseGuards(AdminGuard) @Post('admin/products') createProduct(@Body() dto: ProductDto) { const { variants, ...data } = dto; return this.prisma.product.create({ data: { ...data, variants: variants ? { create: variants } : undefined }, include: { variants: true } }); }
  @UseGuards(AdminGuard) @Patch('admin/products/:id') updateProduct(@Param('id') id: string, @Body() dto: Partial<ProductDto>) { const { variants, ...data } = dto; return this.prisma.product.update({ where: { id }, data: { ...data, ...(variants ? { variants: { deleteMany: {}, create: variants } } : {}) }, include: { variants: true } }); }
  @UseGuards(AdminGuard) @Delete('admin/products/:id') deleteProduct(@Param('id') id: string) { return this.prisma.product.delete({ where: { id } }); }

  @UseGuards(AdminGuard) @Get('admin/gallery') adminGallery() { return this.prisma.galleryImage.findMany({ orderBy: { sortOrder: 'asc' } }); }
  @UseGuards(AdminGuard) @Post('admin/gallery') createGallery(@Body() dto: GalleryDto) { return this.prisma.galleryImage.create({ data: dto }); }
  @UseGuards(AdminGuard) @Patch('admin/gallery/:id') updateGallery(@Param('id') id: string, @Body() dto: Partial<GalleryDto>) { return this.prisma.galleryImage.update({ where: { id }, data: dto }); }
  @UseGuards(AdminGuard) @Delete('admin/gallery/:id') deleteGallery(@Param('id') id: string) { return this.prisma.galleryImage.delete({ where: { id } }); }

  @UseGuards(AdminGuard) @Get('admin/promotions') adminPromotions() { return this.prisma.promotion.findMany({ orderBy: { createdAt: 'desc' } }); }
  @UseGuards(AdminGuard) @Post('admin/promotions') createPromotion(@Body() dto: PromotionDto) { const { startsAt, endsAt, ...data } = dto; return this.prisma.promotion.create({ data: { ...data, startsAt: startsAt ? new Date(startsAt) : undefined, endsAt: endsAt ? new Date(endsAt) : undefined } }); }
  @UseGuards(AdminGuard) @Patch('admin/promotions/:id') updatePromotion(@Param('id') id: string, @Body() dto: Partial<PromotionDto>) { const { startsAt, endsAt, ...data } = dto; return this.prisma.promotion.update({ where: { id }, data: { ...data, ...(startsAt ? { startsAt: new Date(startsAt) } : {}), ...(endsAt ? { endsAt: new Date(endsAt) } : {}) } }); }
  @UseGuards(AdminGuard) @Delete('admin/promotions/:id') deletePromotion(@Param('id') id: string) { return this.prisma.promotion.delete({ where: { id } }); }

  @UseGuards(AdminGuard) @Patch('admin/settings') updateSettings(@Body() dto: SettingsDto) { return this.prisma.siteSettings.upsert({ where: { id: 'default' }, create: { id: 'default', ...dto }, update: dto }); }
}
