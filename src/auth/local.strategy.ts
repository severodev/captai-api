import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {

    // Solution for dynamically loading AuthService
    // https://docs.nestjs.com/security/authentication#request-scoped-strategies

    constructor(private moduleRef: ModuleRef) {
        super({
          passReqToCallback: true,
        });
      }

    async validate(request: Request, email: string, password: string): Promise<any> {

        const contextId = ContextIdFactory.getByRequest(request);
        // "AuthService" is a request-scoped provider
        const authService = await this.moduleRef.resolve(AuthService, contextId);

        const user = await authService.validateUser(email, password);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}