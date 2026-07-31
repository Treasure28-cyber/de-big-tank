import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AdminGuard, AuthService } from './auth';
import { ContentController } from './content.controller';
import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { MediaController } from './media.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret || secret === 'replace-with-a-long-random-secret') {
          throw new Error('JWT_SECRET must be set to a long, private value.');
        }
        return { secret, signOptions: { expiresIn: '8h' } };
      },
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
  ],
  controllers: [AppController, AuthController, ContentController, MediaController],
  providers: [
    PrismaService,
    AuthService,
    AdminGuard,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
