import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EmailService } from './../email/email.service';
import { PasswordRecoveryService } from './../users/services/password-recovery.service';
import { UsersModule } from './../users/users.module';
import { UtilService } from '../util/services/util.service';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { UtilModule } from '../util/util.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { ProfilesService } from '../profiles/services/profiles.service';
import { ImageKitModule } from '@platohq/nestjs-imagekit';
import { ImagekitService } from 'src/imagekit/services/imagekit.service';




@Global()
@Module({
  imports: [
    UsersModule,
    UtilModule,
    ProfilesModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}s`,
        },
      }),
    }),],
  providers: [AuthService, UtilService, PasswordRecoveryService, LocalStrategy, JwtStrategy, EmailService, ProfilesService, ImagekitService],
  exports: [AuthService, ProfilesService],
  controllers: [AuthController]
})
export class AuthModule { }
