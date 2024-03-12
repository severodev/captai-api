/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Body, Controller, HttpCode, Post, Request, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { UpdatePasswordDto } from '../interfaces/update-password.dto';
import { EmailService } from '../../email/email.service';
import { Roles } from '../../roles/roles.decorator';
import { AuthService } from '../services/auth.service';
import { ChangePasswordDto } from '../interfaces/change-password.dto';
import { RecoverPasswordDto } from '../interfaces/recover-password.dto';
import { RefreshTokenDto } from '../interfaces/refresh-token.dto';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { LocalAuthGuard } from '../local-auth.guard';
import { AllExceptionsFilter } from '../../_filters/all-exceptions.filter';

@ApiTags('Authentication')
@Controller('auth')
@UseFilters(AllExceptionsFilter)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emaileService: EmailService
  ) { }

  @ApiBasicAuth()
  @ApiOperation({ summary: 'Login endpoint' })
  @ApiResponse({
    status: 200
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @ApiOperation({ summary: 'Refresh token endpoint' })
  @ApiResponse({
    description: 'Return new valid access and refresh tokens',
    status: 200
  })
  @Post('refreshToken')
  @HttpCode(200)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @ApiOperation({ summary: 'Dispatches a password recovery request for this user' })
  @ApiResponse({
    description: 'User must receive an email with password recovery instructions.',
    status: 200
  })
  @Post('recoverPassword')
  @HttpCode(200)
  async recoverPassword(@Body() recoverPasswordDto: RecoverPasswordDto) {
    const pr = await this.authService.requestPasswordRecovery(
      recoverPasswordDto,
    );
    if (pr) {
      this.emaileService.sendEmailPasswordRecoveryRequest(pr);
    }
  }

  @ApiOperation({ summary: 'Updates the user password based on the current valid password' })
  @ApiResponse({ status: 200 })
  @Post('updatePasswordWithCurrentPassword')
  @HttpCode(200)
  async updatePasswordWithCurrentPassword(@Body() updatePasswrodDto: UpdatePasswordDto, @I18n() i18n: I18nContext) {
    return this.authService.updatePasswordWithCurrentPassword(updatePasswrodDto, i18n);
  }

  @ApiOperation({ summary: 'Updates the user password during the password recovery process' })
  @ApiResponse({ status: 200 })
  @Post('updatePasswordFromRecovery')
  @HttpCode(200)
  async updatePasswordFromRecovery(@Body() updatePasswrodDto: UpdatePasswordDto) {
    return this.authService.updatePasswordFromRecovery(updatePasswrodDto);
  }

  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: "Changes a given user's password" })
  @ApiResponse({ status: 200 })
  @Post('changePassword')
  @HttpCode(200)
  async changePassword(@Body() changePasswrodDto: ChangePasswordDto) {
    return this.authService.changePassword(changePasswrodDto);
  }

}
