import { Body, ClassSerializerInterceptor, Controller, Get, Param, Put, Req, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AllExceptionsFilter } from '../../_filters/all-exceptions.filter';
import { Permissions } from '../decorators/permissions.decorator';
import { Permission } from '../entity/permission.entity';
import { Profile } from '../entity/profile.entity';
import { PermissionsEnum } from '../enum/permissions.enum';
import { ProfilesService } from '../services/profiles.service';

@UseGuards(JwtAuthGuard)
@ApiTags('Profiles')
@Controller('profiles')
@UseFilters(AllExceptionsFilter)
@UseInterceptors(ClassSerializerInterceptor)
export class ProfilesController {

    constructor(private readonly service: ProfilesService) { }

    @Permissions(PermissionsEnum.PROFILE_LIST)
    @Get()
    getProfiles(): Promise<Profile[]> {
        return this.service.getAll();
    }

    @Permissions(PermissionsEnum.PROFILE_VIEW)
    @Get(':id')
    getProfileById(@Param('id') id: number): Promise<Profile> {
        return this.service.getById(id);
    }

    @Permissions(PermissionsEnum.PROFILE_EDIT)
    @Put(':id/permissions')
    updateProfilePermissions(@Param('id') id: number, @Req() @Body() permissions: Permission[]): Promise<Profile> {
        return this.service.updatePermissions(id, permissions);
    }
}
