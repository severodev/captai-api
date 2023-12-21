import { Body, ClassSerializerInterceptor, Controller, Get, Param, Post, Put, Query, Req, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationMetadataDto } from '../../util/interfaces/pagination-metadata.dto';
import { CreatePasswordDto } from '../../users/interfaces/create-password.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../roles/roles.decorator';
import { AllExceptionsFilter } from '../../_filters/all-exceptions.filter';
import { User } from '../entity/user.entity';
import { CreateUserDto } from '../interfaces/create-user.dto';
import { UpdateUserDto } from '../interfaces/update-user.dto';
import { UsersService } from '../services/users.service';
import { Permissions } from '../../profiles/decorators/permissions.decorator';
import { PermissionsEnum } from '../../profiles/enum/permissions.enum';


@ApiTags('Users')
@Controller('users')
@UseFilters(AllExceptionsFilter)
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {

    constructor(
        private readonly usersService: UsersService,
    ) { }

    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @Permissions(PermissionsEnum.USER_LIST)
    @Get('pagination')
    async userPages(@Query('search') search: string,
        @Query('itemsPerPage') itemsPerPage = 10,
        @Query('isActive') isActive = true, @Query('filters') filters: any): Promise<PaginationMetadataDto> {
        return this.usersService.pagination(search, itemsPerPage, isActive, filters);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get All Users' })
    @ApiResponse({
        status: 200
    })
    @UseGuards(JwtAuthGuard)
    @Roles('ADMIN')
    @Permissions(PermissionsEnum.USER_LIST)
    @Get()
    findUsers(@Query('search') search, 
    @Query('orderby') orderby,
    @Query('desc') desc: number, 
    @Query('itemsPerPage') itemsPerPage = 10,
    @Query('page') page = 1, 
    @Query('isActive') isActive = true,
    @Query('filters') filters: any): Promise<User[]> {
        return this.usersService.findUsers(search, orderby, (desc && desc > 0), itemsPerPage, page, isActive, filters);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Creates a new user' })
    @ApiResponse({
        status: 200
    })
    @UseGuards(JwtAuthGuard)
    @Roles('ADMIN')
    @Permissions(PermissionsEnum.USER_CREATE)
    @Post()
    register(@Req() req: any,  @Body() createUserDto: CreateUserDto) {
        
        return this.usersService.create(createUserDto, req.auditEntry);
    }
    
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Updates a user' })
    @ApiResponse({
        status: 200
    })
    @UseGuards(JwtAuthGuard)
    @Roles('ADMIN')
    @Permissions(PermissionsEnum.USER_EDIT)
    @Put(':id')
    update(@Req() req: any, @Body() updateUserDto: UpdateUserDto, @Param('id') id: string) {
        return this.usersService.update(updateUserDto, id, req.auditEntry);
    }
 
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Deletes a user' })
    @ApiResponse({
        status: 200
    })
    @UseGuards(JwtAuthGuard)
    @Roles('ADMIN')
    @Permissions(PermissionsEnum.USER_DELETE)
    @Put('delete/:id')
    delete(@Req() req: any, @Param('id') id: string) {
        return this.usersService.delete(id, req.auditEntry);
    }
   
    @ApiOperation({ summary: 'Create the user password based on the first access request' })
    @ApiResponse({ status: 200 })
    @Post('firstAccess')
    async createPasswordFirstAccess(@Body() createPasswordDto: CreatePasswordDto) {
        return this.usersService.createPasswordFirstAccess(createPasswordDto);
    }
}