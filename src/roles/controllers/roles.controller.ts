import { Controller, Get, UseFilters, UseGuards } from '@nestjs/common';
import { RolesService } from '../services/roles.service';
import { Roles } from '../roles.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { AllExceptionsFilter } from '../../_filters/all-exceptions.filter';

@UseGuards(JwtAuthGuard)
@ApiTags('User Roles')
@Controller('roles')
@UseFilters(AllExceptionsFilter)
export class RolesController {

    constructor(private readonly rolesService: RolesService) { }

    @Roles('ADMIN')
    @Get()
    findAll(): any {
        return this.rolesService.findAll();
    }

}
