import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AdminGuard, AuthService } from './auth';
import { ContentController } from './content.controller';
import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), JwtModule.register({ global: true, secret: process.env.JWT_SECRET ?? 'replace-this-in-production', signOptions: { expiresIn: '8h' } }), ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }])],
  controllers: [AppController, AuthController, ContentController],
  providers: [PrismaService, AuthService, AdminGuard],
})
export class AppModule {}
