import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FindManyOptions, Raw, Repository } from 'typeorm';
import { I18nRequestScopeService } from 'nestjs-i18n';
import { UpdatePasswordDto } from '../../auth/interfaces/update-password.dto';
import { RecoverPasswordDto } from '../../auth/interfaces/recover-password.dto';
import { CollaboratorsService } from '../../collaborators/services/collaborators.service';
import { RolesService } from '../../roles/services/roles.service';
import { UtilService } from "../../util/services/util.service";
import { CreateUserDto } from '../interfaces/create-user.dto';
import { PasswordRecovery } from '../entity/password-recovery.entity';
import { PasswordRecoveryService } from "./password-recovery.service";
import { User } from "../entity/user.entity";
import { UserDto } from '../interfaces/user.dto';
import { ChangePasswordDto } from '../../auth/interfaces/change-password.dto';
import { UpdateUserDto } from '../interfaces/update-user.dto';
import { AudityEntryDto } from '../../audit/interface/audit-entry.dto';
import { AuditService } from './../../audit/service/audit.service';
import { classToPlain } from 'class-transformer';
import { PaginationMetadataDto } from '../../util/interfaces/pagination-metadata.dto';
import { CreatePasswordDto } from '../../users/interfaces/create-password.dto';
import { FirstAccess } from '../entity/first-access.entity';
import { FirstAccessService } from './first-access.service';
import { EmailService } from '../../email/email.service';
import { ProfilesService } from '../../profiles/services/profiles.service';

@Injectable()
export class UsersService {

    constructor(
        @Inject('USERS_REPOSITORY')
        private usersRepository: Repository<User>,
        private utilService: UtilService,
        private readonly rolesService: RolesService,
        private readonly profilesService: ProfilesService,
        private readonly auditService: AuditService,
        private readonly collaboratorService: CollaboratorsService,
        private readonly passwordRecoveryService: PasswordRecoveryService,
        private readonly firstAccessService: FirstAccessService,
        private readonly emailService: EmailService,
        private readonly i18n: I18nRequestScopeService) { }


    async pagination(search: string, itemsPerPage = 10, isActive: boolean, _filters: any): Promise<PaginationMetadataDto> {
        const filters: FindManyOptions<User> = {
            where: {
                active: true,
            },
        };
        if (search && search.length > 0) {
            const nameFilters = search.split(' ').map(s => {
                return { name: Raw(alias => `${alias} ilike '%${s}%'`) };
            });
            filters.where = nameFilters;
        }

        const totalItems = await this.usersRepository.count({ ...filters });
        const paginationMetadata: PaginationMetadataDto = {
            totalItems,
            itemsPerPage: +itemsPerPage, // weird stuff here, always returning string
            totalPages: Math.ceil(totalItems / itemsPerPage),
        };

        return paginationMetadata;
    }

    async findById(userId: number) {
        return this.usersRepository.findOne(userId);
    }

    async findByUsername(username: string) {
        return this.usersRepository.findOne({ where: { username: username } });
    }

    async findUsers(
        stringSearch: string,
        orderby: string,
        desc: boolean,
        itemsPerPage: number,
        page: number,
        isActive: boolean,
        _filters: any,): Promise<User[]> {
        const _where: any = {
            active: isActive,
        };

        const filters: FindManyOptions<UserDto> = {
            take: itemsPerPage,
            skip: (page > 0 ? page - 1 : 0) * itemsPerPage,
            where: {
                active: isActive,
            },
        };
        if (stringSearch && stringSearch.length > 0) {
            const nameFilters = stringSearch.split(' ').map(s => {
                return { name: Raw(alias => `${alias} ilike '%${s}%'`), active: true };
            });
            filters.where = nameFilters;
            _where.nameFilter = nameFilters;
        }
        if (orderby && orderby.length > 0) {
            filters.order = {
                [orderby.includes('d') ? 'created' : 'name']: desc ? 'DESC' : 'ASC',
            };
        }
        const filteredUsers = this.usersRepository.find({ ...filters })
        return this.usersRepository.find({ ...filters })
    }

    async create(createUserDto: CreateUserDto, auditEntry: AudityEntryDto): Promise<UserDto> {

        const newUser = new User();
        newUser.active = true;
        newUser.username = createUserDto.username;
        newUser.password = await this.utilService.generateHash(createUserDto.username + new Date().getMilliseconds());
        newUser.email = createUserDto.email;

        if (createUserDto.fullname) {
            newUser.fullname = createUserDto.fullname;
        }

        if (createUserDto.language) {
            newUser.language = createUserDto.language;
        }
        if (createUserDto.role) {
            const role = await this.rolesService.findOne(createUserDto.role);
            newUser.role = role;
        }
        if (createUserDto.profile) {
            const profile = await this.profilesService.getByKey(createUserDto.profile);
            newUser.profile = profile;
        }
        if (createUserDto.collaborator) {
            newUser.collaborator = await this.collaboratorService.findOne(createUserDto.collaborator);
        }
        const savedUser = await this.usersRepository.save(newUser);

        if (auditEntry) {
            auditEntry.actionType = 'CREATE';
            auditEntry.targetEntity = this.usersRepository.metadata.targetName;
            auditEntry.targetTable = this.usersRepository.metadata.tableName;
            auditEntry.targetEntityId = newUser.id;
            auditEntry.targetEntityBody = JSON.stringify(
                classToPlain(newUser),
            );
            this.auditService.audit(auditEntry);
        }

        await this.requestFirstAccess(savedUser);

        return <UserDto>{
            id: savedUser.id,
            username: savedUser.username,
            role: {
                id: savedUser.role.id,
                type: savedUser.role.type
            }, // TODO: filter this information by role of the requester
            profile: {
                id: savedUser.profile.id,
                key: savedUser.profile.key
            },
            collaborator: savedUser.collaborator && savedUser.collaborator.id ? savedUser.collaborator.id : null
        };
    }

    async update(updateUserDto: UpdateUserDto, id: string, auditEntry: AudityEntryDto) {
        const user = await this.usersRepository.findOne(id)

        if (!user) {
            throw new NotFoundException(
                await this.i18n.translate('user.NOT_FOUND', {
                    args: { id: id },
                })
            )
        }

        user.username = updateUserDto.username
        user.fullname = updateUserDto.fullname
        user.email = updateUserDto.email
        user.language = updateUserDto.language

        if (updateUserDto.collaborator) {
            user.collaborator = await this.collaboratorService.findOne(updateUserDto.collaborator)
        }
        if (updateUserDto.role) {
            user.role = await this.rolesService.findOne(updateUserDto.role)
        }
        if (updateUserDto.profile) {
            user.profile = await this.profilesService.getByKey(updateUserDto.profile)
        }
        this.usersRepository.save(user)

        if (auditEntry) {
            auditEntry.actionType = 'UPDATE';
            auditEntry.targetEntity = this.usersRepository.metadata.targetName;
            auditEntry.targetTable = this.usersRepository.metadata.tableName;
            auditEntry.targetEntityId = user.id;
            auditEntry.targetEntityBody = JSON.stringify(
                classToPlain(user),
            );
            this.auditService.audit(auditEntry);
        }


        return <UpdateUserDto>{
            id: user.id,
            username: user.username,
            fullname: user.fullname,
            email: user.email,
            language: user.language,
            profile: user.profile.key,
        }
    }

    async delete(id: string, auditEntry: AudityEntryDto) {
        const user = await this.usersRepository.findOne(id)

        if (!user) {
            throw new NotFoundException(
                await this.i18n.translate('user.NOT_FOUND', {
                    args: { id: id },
                })
            )
        }

        user.active = false
        this.usersRepository.save(user)

        if (auditEntry) {
            auditEntry.actionType = 'DELETE';
            auditEntry.targetEntity = this.usersRepository.metadata.targetName;
            auditEntry.targetTable = this.usersRepository.metadata.tableName;
            auditEntry.targetEntityId = user.id;
            auditEntry.targetEntityBody = '';
            this.auditService.audit(auditEntry);
        }

        return user.active === false;
    }

    async updatePasswordWithCurrentPassword(user: User, newPassword: string): Promise<boolean> {
        user.password = await this.utilService.generateHash(newPassword);
        this.usersRepository.save(user);
        return true;
    }

    async requestPasswordRecovery(recoverPasswordDto: RecoverPasswordDto): Promise<PasswordRecovery> {
        const user = await this.findByUsername(recoverPasswordDto.username);
        // console.log(user);

        if (user) {

            const pr = new PasswordRecovery();
            pr.user = user;
            pr.token = await this.utilService.generateHash(user.username + new Date().getMilliseconds());

            this.passwordRecoveryService.invalidateUsersPastRecoveryRequest(pr);
            this.passwordRecoveryService.createPasswordRecoveryRequest(pr);

            if (!user.passwordRecovery) {
                user.passwordRecovery = [];
            }

            user.passwordRecovery.push(pr);
            await this.usersRepository.save(user);

            return pr;
        }
        return null;
    }

    async updatePasswordFromRecovery(updatePasswordDto: UpdatePasswordDto): Promise<boolean> {
        const pr = await this.passwordRecoveryService.checkRecoveryTokenValidity(updatePasswordDto);

        if (pr) {
            pr.used = true;

            const user = pr.user;
            user.password = await this.utilService.generateHash(updatePasswordDto.newPassword);

            this.usersRepository.save(user);
            this.passwordRecoveryService.createPasswordRecoveryRequest(pr);

            return true;
        }
        return false;
    }

    async changePassword(changePasswordDto: ChangePasswordDto): Promise<boolean> {

        const user = await this.usersRepository.findOne(changePasswordDto.userId);
        user.password = await this.utilService.generateHash(changePasswordDto.newPassword);

        this.usersRepository.save(user);
        return true;
    }

    async updateRefreshToken(userId: number, refreshToken: string) {
        const user = await this.usersRepository.findOne(userId);
        if (user) {
            user.refreshToken = refreshToken;
            this.usersRepository.save(user);
        }
    }

    async requestFirstAccess(user: User): Promise<void> {
        if (user) {
            const firstAccessRequest = new FirstAccess();
            firstAccessRequest.user = user;
            const token = await (await this.utilService.generateHash(user.username + new Date().getMilliseconds()))
            firstAccessRequest.token = token.replace(/[^a-zA-Z0-9 ]/g, '');

            this.firstAccessService.create(firstAccessRequest);

            if (!user.firstAccess) {
                user.firstAccess = [];
            }

            user.firstAccess.push(firstAccessRequest);
            await this.usersRepository.save(user);

            this.emailService.sendEmailFirstAccessRequest(firstAccessRequest);
        }
    }

    async createPasswordFirstAccess(createPasswordDto: CreatePasswordDto): Promise<boolean> {
        const firstAccessRequest = await this.firstAccessService.findByToken(createPasswordDto.token);

        if(firstAccessRequest) {
            firstAccessRequest.user.password = await this.utilService.generateHash(createPasswordDto.password);
            await this.usersRepository.save(firstAccessRequest.user);
            await this.firstAccessService.invalidateRequest(firstAccessRequest);
            return true;
        }

        return false;
    }
}