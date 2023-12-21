import { HttpException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from "bcrypt";
import { I18nContext } from 'nestjs-i18n';
import { PasswordRecovery } from '../../users/entity/password-recovery.entity';
import { User } from '../../users/entity/user.entity';
import { UsersService } from "../../users/services/users.service";
import { UtilService } from "../../util/services/util.service";
import { LoginResultDto } from '../interfaces/change-password.dto copy';
import { UpdatePasswordDto } from './../../auth/interfaces/update-password.dto';
import { UserDto } from './../../users/interfaces/user.dto';
import { PasswordRecoveryService } from "./../../users/services/password-recovery.service";
import { ChangePasswordDto } from './../interfaces/change-password.dto';
import { RecoverPasswordDto } from './../interfaces/recover-password.dto';
import { RefreshTokenDto } from './../interfaces/refresh-token.dto';

@Injectable()
export class AuthService {

    constructor(
        private readonly jwtService: JwtService,
        private readonly utilService: UtilService,
        private readonly usersService: UsersService,
        private readonly passwordRecoveryService: PasswordRecoveryService
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {

        const user: User = await this.usersService.findByUsername(username);
        if (user) {
            const validCredentials = await this.verifyPassword(pass, user.password);
            if (validCredentials) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { password, ...otherUserFileds } = user;
                return otherUserFileds;
            }
        }

        return null;
    }

    async login(user: UserDto): Promise<LoginResultDto>  {
        const payload = {
            username: user.username, sub: user.id, fullname: user.fullname,
            role: user.role.type, language: user.language, profile: user.profile?.key
        };
        return await this.generateTokens(payload);
    }

    async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<LoginResultDto | HttpException> {
        const user = await this.usersService.findByUsername(refreshTokenDto.username);
        if (user && refreshTokenDto.refreshToken === user.refreshToken) {
            const payload = { username: user.username, sub: user.id };
            return await this.generateTokens(payload);
        }
        return new UnauthorizedException('Falha ao atulizar reefresh token','Refresh token inválido ou inexistente');
    }

    private async generateTokens(payload: any) : Promise<LoginResultDto> {
        const refreshToken = await this.utilService.generateHash(new Date().getMilliseconds().toString());
        this.usersService.updateRefreshToken(payload.sub, refreshToken);

        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: refreshToken,
        };
    }

    async verifyPassword(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
        const isPasswordMatching = await bcrypt.compare(
            plainTextPassword,
            hashedPassword
        );
        return isPasswordMatching;
    }

    async updatePasswordWithCurrentPassword(updatePasswordDto: UpdatePasswordDto, i18n: I18nContext): Promise<boolean> {

        const validUser = await this.validateUser(updatePasswordDto.username, updatePasswordDto.oldPassword);
        if(!validUser){
            throw new NotFoundException(
                await i18n.translate('auth.CHANGE_PASSWORD_WRONG_CREDENTIALS')
            );
        }

        return this.usersService.updatePasswordWithCurrentPassword(validUser, updatePasswordDto.newPassword);
    }

    async requestPasswordRecovery(recoverPasswordDto: RecoverPasswordDto): Promise<PasswordRecovery> {
        return await this.usersService.requestPasswordRecovery(recoverPasswordDto);
    }

    async checkRecoveryTokenValidity(updatePasswordDto: UpdatePasswordDto): Promise<boolean> {
        const pr = await this.passwordRecoveryService.checkRecoveryTokenValidity(updatePasswordDto);
        if (pr) {
            const user = pr.user;
            return user && user.id > 0 && user.refreshToken.length > 0;
        }

        return false;
    }

    async updatePasswordFromRecovery(updatePasswordDto: UpdatePasswordDto): Promise<boolean> {
        return this.usersService.updatePasswordFromRecovery(updatePasswordDto);
    }

    async changePassword(changePasswordDto: ChangePasswordDto): Promise<boolean> {
        return this.usersService.changePassword(changePasswordDto);
    }

    async valdidateAndDecodeToken(token: string): Promise<any> {
        try{
            const decodedToken = this.jwtService.verify(token);
            return decodedToken;
        } catch (e) {
            return null;
        }
    }

}
