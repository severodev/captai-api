import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { I18nContext } from 'nestjs-i18n';
import { ProfilesService } from './../profiles/services/profiles.service';
import { AudityEntryDto } from './../audit/interface/audit-entry.dto';
import { AuthService } from './services/auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {

    constructor(private reflector: Reflector,
        private readonly authSerice: AuthService,
        private readonly profileService: ProfilesService,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Basic authorization: Bearer presence in the Authorization header
        const request = context.switchToHttp().getRequest();
        const bearerToken = request.headers.authorization ? request.headers.authorization : '';
        const decodedToken: any = await this.authSerice.valdidateAndDecodeToken(bearerToken.toString().replace('Bearer ', ''));

        if (!decodedToken) {
            throw new UnauthorizedException();
        }

        // Filling up user information for the upcoming request lifecycle
        if(!request.user){
            request.user = {
                id: decodedToken.sub,
                role: decodedToken.role,
                profile: decodedToken.profile
            }
        }
        request.auditEntry = <AudityEntryDto>{
            userId: decodedToken.sub,
            userRole: decodedToken.role,
            userProfile: decodedToken.profile
        };

        // Extracting route role requirements
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!roles) {
            return true;
        }

        let canAccess = this.matchRoles(roles, [decodedToken.role]);
        if (!canAccess) {
            throw new ForbiddenException(
                await I18nContext.current().translate('auth.PERMISSION_FORBIDDEN_ACTION')
            );
        }

        // Extracting route permission requirements
        const permissions = this.reflector.get<string[]>('permissions', context.getHandler());
        if (!permissions) {
            return true;
        }

        canAccess = await this.matchPermissions(permissions, decodedToken.profile);
        if (!canAccess) {
            throw new ForbiddenException(
                await I18nContext.current().translate('auth.PERMISSION_FORBIDDEN_ACTION')
            );
        }

        return true;
    }

    matchRoles(requestedRoles: string[], userRoles: string[]): boolean {
        const grantedRoles = requestedRoles.filter(r => userRoles.includes(r));
        return grantedRoles.length > 0;
    }

    async matchPermissions(requestedPermissions: string[], userProfile: string): Promise<boolean> {
        const profile = await this.profileService.getByKey(userProfile);
        const userRoles = profile.permissions.map(p => p.key);
        const grantedRoles = requestedPermissions.filter(r => userRoles.includes(r));
        return grantedRoles.length > 0;
    }
}
