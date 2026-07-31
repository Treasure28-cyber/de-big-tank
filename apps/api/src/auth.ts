import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from './prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async login(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin || !admin.isActive || !(await bcrypt.compare(password, admin.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return {
      accessToken: await this.jwt.signAsync({ sub: admin.id, email: admin.email, role: admin.role }),
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    };
  }
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      admin?: { id: string; email: string; role: string };
    }>();
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) throw new UnauthorizedException('Missing bearer token');
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; email: string; role: string }>(token);
      const admin = await this.prisma.admin.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, role: true, isActive: true },
      });
      if (!admin?.isActive) throw new UnauthorizedException('Invalid or expired token');
      if (admin.role !== 'ADMIN') throw new ForbiddenException('Insufficient permissions');
      request.admin = { id: admin.id, email: admin.email, role: admin.role };
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
