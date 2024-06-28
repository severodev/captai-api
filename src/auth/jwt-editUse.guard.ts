import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { I18nContext } from 'nestjs-i18n';
import { ProfilesService } from './../profiles/services/profiles.service';
import { AuthService } from './services/auth.service';

@Injectable()
export class jwtEditUseGuard extends AuthGuard('jwt') implements CanActivate {

    constructor(
        private readonly authSerice: AuthService
    ) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const bearerToken = request.headers.authorization ? request.headers.authorization : '';
        const decodedToken: any = await this.authSerice.valdidateAndDecodeToken(bearerToken.toString().replace('Bearer ', ''));

        if (!decodedToken) {
            throw new UnauthorizedException();
        }
        if (decodedToken.id != request.params.id && decodedToken.role != 'ADMIN') {
            throw new ForbiddenException(
                await I18nContext.current().translate('auth.PERMISSION_FORBIDDEN_ACTION')
            );
        }
        return true;
    }
}
