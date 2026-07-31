import { BadRequestException, Controller, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Request } from 'express';
import { AdminGuard } from './auth';
import { PrismaService } from './prisma.service';

type AdminRequest = Request & { admin: { id: string } };

@Controller('admin/media')
@UseGuards(AdminGuard)
export class MediaController {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024, files: 1 } }))
  async upload(@Req() request: AdminRequest, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Choose an image to upload.');
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, WebP and AVIF images are supported.');
    }
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');
    if (!cloudName || !apiKey || !apiSecret) {
      throw new BadRequestException('Image uploads are not configured. Add the Cloudinary environment values.');
    }
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'de-big-tank', resource_type: 'image' },
        (error, uploaded) => error || !uploaded ? reject(error ?? new Error('Upload failed')) : resolve(uploaded),
      ).end(file.buffer);
    });
    await this.prisma.auditEvent.create({
      data: { actorId: request.admin.id, action: 'UPLOAD', entityType: 'Media', entityId: result.public_id },
    });
    return { imageUrl: result.secure_url, publicId: result.public_id, width: result.width, height: result.height };
  }
}
