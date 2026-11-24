import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateSubscriberDto {
  @IsString() @MinLength(1) @MaxLength(80) firstName!: string;
  @IsEmail() @MaxLength(254) email!: string;
  @IsOptional() @IsString() @MaxLength(24) @Matches(/^(?:\+?234|0)?[789][01]\d{8}$/) whatsappNumber?: string;
  @IsBoolean() consent!: boolean;
}

export class AnnouncementDto {
  @IsString() @MinLength(1) @MaxLength(180) subject!: string;
  @IsString() @MinLength(1) @MaxLength(10000) message!: string;
  @IsIn(['all', 'email', 'whatsapp']) audience!: 'all' | 'email' | 'whatsapp';
  @IsOptional() @IsBoolean() preview?: boolean;
}
