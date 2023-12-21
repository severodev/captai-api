import { ClassSerializerInterceptor, Controller, Get, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AllExceptionsFilter } from '../../_filters/all-exceptions.filter';
import { Permissions } from '../decorators/permissions.decorator';
import { Permission } from '../entity/permission.entity';
import { PermissionsEnum } from '../enum/permissions.enum';
import { PermissionService } from '../services/permission.service';

@UseGuards(JwtAuthGuard)
@ApiTags('Permissions')
@Controller('permissions')
@UseFilters(AllExceptionsFilter)
@UseInterceptors(ClassSerializerInterceptor)
export class PermissionsController {

    constructor(private readonly service: PermissionService) { }

    @Permissions(PermissionsEnum.PERMISSION_LIST)
    @Get()
    getAll(): Promise<Permission[]> {
        return this.service.getAll();
    }
}
