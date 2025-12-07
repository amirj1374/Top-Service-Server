import { Injectable, ExecutionContext, UnauthorizedException, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Check if route is marked as public FIRST, before any Passport logic
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If route is public, return true immediately WITHOUT calling super.canActivate
    // This completely bypasses Passport authentication
    if (isPublic) {
      return true;
    }

    // Only call super.canActivate for protected routes
    return super.canActivate(context);
  }

  // Override handleRequest to prevent errors for public routes (shouldn't be called, but just in case)
  handleRequest(err: any, user: any, info: any) {
    // If there's an error or no user, throw 401 Unauthorized
    if (err || !user) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      if (info?.message === 'No auth token' || info?.message === 'jwt must be provided') {
        throw new UnauthorizedException('Authentication token required');
      }
      throw err || new UnauthorizedException('Authentication failed');
    }
    return user;
  }
}

