import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ServiceLine } from '@prisma/client';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const whatsappPattern = /^\d{7,15}$/;

export class CatalogQueryDto {
  @IsOptional()
  @IsEnum(ServiceLine)
  line?: ServiceLine;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  q?: string;

  @IsOptional()
  @IsString()
  category?: string;
}

export class CreateCategoryDto {
  @IsString() @MinLength(2) @MaxLength(80) name!: string;
  @IsString() @Matches(slugPattern) slug!: string;
  @IsEnum(ServiceLine) serviceLine!: ServiceLine;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(10_000) sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateCategoryDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(80) name?: string;
  @IsOptional() @IsString() @Matches(slugPattern) slug?: string;
  @IsOptional() @IsEnum(ServiceLine) serviceLine?: ServiceLine;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(10_000) sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class VariantDto {
  @IsString() @MinLength(1) @MaxLength(80) name!: string;
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(-10_000_000) priceDelta!: number;
  @IsOptional() @IsBoolean() isAvailable?: boolean;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(10_000) sortOrder?: number;
}

export class CreateProductDto {
  @IsString() @MinLength(2) @MaxLength(120) name!: string;
  @IsString() @Matches(slugPattern) slug!: string;
  @IsString() @MinLength(2) @MaxLength(2_000) description!: string;
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) price!: number;
  @IsString() categoryId!: string;
  @IsOptional() @IsUrl({ require_protocol: true }) imageUrl?: string;
  @IsOptional() @IsString() @MaxLength(180) altText?: string;
  @IsOptional() @IsBoolean() isAvailable?: boolean;
  @IsOptional() @IsBoolean() allowsSpecialNotes?: boolean;
  @IsOptional() @IsArray() @ArrayMaxSize(30) @ValidateNested({ each: true }) @Type(() => VariantDto) variants?: VariantDto[];
}

export class UpdateProductDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(120) name?: string;
  @IsOptional() @IsString() @Matches(slugPattern) slug?: string;
  @IsOptional() @IsString() @MinLength(2) @MaxLength(2_000) description?: string;
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) price?: number;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsUrl({ require_protocol: true }) imageUrl?: string;
  @IsOptional() @IsString() @MaxLength(180) altText?: string;
  @IsOptional() @IsBoolean() isAvailable?: boolean;
  @IsOptional() @IsBoolean() allowsSpecialNotes?: boolean;
  @IsOptional() @IsArray() @ArrayMaxSize(30) @ValidateNested({ each: true }) @Type(() => VariantDto) variants?: VariantDto[];
}

export class CreateGalleryDto {
  @IsUrl({ require_protocol: true }) imageUrl!: string;
  @IsString() @MinLength(2) @MaxLength(180) altText!: string;
  @IsOptional() @IsString() @MaxLength(500) caption?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateGalleryDto {
  @IsOptional() @IsUrl({ require_protocol: true }) imageUrl?: string;
  @IsOptional() @IsString() @MinLength(2) @MaxLength(180) altText?: string;
  @IsOptional() @IsString() @MaxLength(500) caption?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class CreatePromotionDto {
  @IsString() @MinLength(2) @MaxLength(120) title!: string;
  @IsString() @Matches(slugPattern) slug!: string;
  @IsString() @MinLength(2) @MaxLength(2_000) description!: string;
  @IsOptional() @IsUrl({ require_protocol: true }) imageUrl?: string;
  @IsOptional() @IsDateString() startsAt?: string;
  @IsOptional() @IsDateString() endsAt?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdatePromotionDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(120) title?: string;
  @IsOptional() @IsString() @Matches(slugPattern) slug?: string;
  @IsOptional() @IsString() @MinLength(2) @MaxLength(2_000) description?: string;
  @IsOptional() @IsUrl({ require_protocol: true }) imageUrl?: string;
  @IsOptional() @IsDateString() startsAt?: string;
  @IsOptional() @IsDateString() endsAt?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateSettingsDto {
  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.replace(/\D/g, '') : value)
  @Matches(whatsappPattern)
  whatsappNumber?: string;

  @IsOptional() @IsString() @MaxLength(120) businessName?: string;
  @IsOptional() @IsString() @MaxLength(180) tagline?: string;
  @IsOptional() @IsPhoneNumber() phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @MaxLength(500) address?: string;
  @IsOptional() @IsUrl({ require_protocol: true }) mapEmbedUrl?: string;
  @IsOptional() @IsObject() businessHours?: Record<string, unknown>;
  @IsOptional() @IsObject() socialLinks?: Record<string, unknown>;
  @IsOptional() @IsString() @MaxLength(140) heroTitle?: string;
  @IsOptional() @IsString() @MaxLength(300) heroSubtitle?: string;
  @IsOptional() @IsUrl({ require_protocol: true }) heroImageUrl?: string;
  @IsOptional() @IsString() @MaxLength(180) heroImageAlt?: string;
}
