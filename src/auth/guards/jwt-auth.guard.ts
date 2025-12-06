import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If route is public, allow access without authentication
    if (isPublic) {
      return true;
    }

    // Check if Authorization header exists - check both lowercase and uppercase
    const request = context.switchToHttp().getRequest();
    const headers = request.headers || {};
    
    // Try multiple possible header formats
    const authHeader = headers.authorization || headers.Authorization || headers.AUTHORIZATION || 
                       request.headers?.authorization || request.headers?.Authorization;
    
    // If no token is provided, throw 401 Unauthorized IMMEDIATELY
    if (!authHeader || (typeof authHeader === 'string' && authHeader.trim().length === 0)) {
      throw new UnauthorizedException('Authentication token required');
    }
    
    // Check if it starts with Bearer (case insensitive)
    const authHeaderStr = typeof authHeader === 'string' ? authHeader.trim() : String(authHeader).trim();
    if (!authHeaderStr.toLowerCase().startsWith('bearer ')) {
      throw new UnauthorizedException('Authentication token required');
    }

    // Let Passport validate the token
    const result = super.canActivate(context);
    
    // Handle Observable result from Passport
    if (result instanceof Observable) {
      return result.pipe(
        map((value) => {
          if (!value) {
            throw new UnauthorizedException('Authentication failed');
          }
          return value;
        })
      );
    }
    
    // Handle Promise result from Passport
    if (result instanceof Promise) {
      return result.then(
        (value) => {
          if (!value) {
            throw new UnauthorizedException('Authentication failed');
          }
          return value;
        },
        (error) => {
          throw error instanceof UnauthorizedException ? error : new UnauthorizedException('Authentication failed');
        }
      );
    }
    
    // Handle boolean result
    if (result === false) {
      throw new UnauthorizedException('Authentication failed');
    }
    
    return result;
  }

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

