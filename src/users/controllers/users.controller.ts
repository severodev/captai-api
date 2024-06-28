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
import { RecoverPasswordDto } from 'src/auth/interfaces/recover-password.dto';
import { tokenDto } from '../interfaces/token.dto';
import { UserFilter } from '../interfaces/user.filter';
import { jwtEditUseGuard } from 'src/auth/jwt-editUse.guard';


@ApiTags('Users')
@Controller('users')
@UseFilters(AllExceptionsFilter)
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {

    constructor(
        private readonly usersService: UsersService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Roles('ADMIN')
    @Get()
    findAll(@Query() filter: UserFilter, @Query() pageOptions: PaginationMetadataDto): Promise<User[]> {
        return this.usersService.findAll(filter, pageOptions);
    }

    /* @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @Permissions(PermissionsEnum.USER_LIST)
    @Get()
    async userPages(@Query('search') search: string,
        @Query('itemsPerPage') itemsPerPage = 10,
        @Query('isActive') isActive = true, @Query('filters') filters: any): Promise<PaginationMetadataDto> {
        return this.usersService.pagination(search, itemsPerPage, isActive, filters);
    } */

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get All Users' })
    @ApiResponse({
        status: 200
    })

    /*     @UseGuards(JwtAuthGuard)
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
        } */

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Creates a new user' })
    @ApiResponse({
        status: 200
    })

    @Post()
    register(@Req() req: any, @Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Put('ChangePassword')
    ChangePassword(@Body() username: RecoverPasswordDto) {
        return this.usersService.requestPasswordRecovery(username);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Updates a user' })
    @ApiResponse({ status: 200 })
    @UseGuards(jwtEditUseGuard)
    @Put(':id')
    update(@Body() updateUserDto: UpdateUserDto, @Param('id') id: string) {
        return this.usersService.update(updateUserDto, id);
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

    @ApiResponse({ status: 200 })
    @Post('validate-email')
    async validateEmail(@Body() token: tokenDto) {
        return this.usersService.validateEmail(token.token);
    }

    @ApiResponse({ status: 200 })
    @Get('check-availability-email')
    async checkAvailability(@Query('email') email: string) {
        return this.usersService.checkAvailabilityEmail(email);
    }

    @ApiResponse({ status: 200 })
    @Get('check-availability-cpf-cnpj')
    async checkAvailabilityCpfCnpj(@Query('cpfCnpj') cpfCnpj: string) {
        return this.usersService.checkAvailabilityCpfCnpj(cpfCnpj);
    }
}
