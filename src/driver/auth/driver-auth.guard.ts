import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DriverAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const auth = String(req.headers?.authorization || '');
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';

    if (!token) throw new UnauthorizedException('missing token');

    const session = await this.prisma.driverSession.findUnique({
      where: { token },
      include: {
        driver: {
          select: { id: true, name: true, phone: true, organizationId: true, status: true, isActive: true },
        },
      },
    });

    if (!session) throw new UnauthorizedException('invalid token');
    if (session.expiresAt.getTime() < Date.now()) throw new UnauthorizedException('token expired');
    if (!session.driver?.isActive) throw new UnauthorizedException('driver inactive');

    await this.prisma.driverSession.update({
      where: { token },
      data: { lastUsedAt: new Date() },
    });

    req.driver = session.driver;
    req.driverToken = token;
    return true;
  }
}