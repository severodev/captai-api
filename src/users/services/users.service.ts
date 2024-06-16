import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FindManyOptions, Like, Raw, Repository } from 'typeorm';
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
import { PaginationMetadataDto } from '../../util/interfaces/pagination-metadata.dto';
import { CreatePasswordDto } from '../../users/interfaces/create-password.dto';
import { FirstAccess } from '../entity/first-access.entity';
import { FirstAccessService } from './first-access.service';
import { EmailService } from '../../email/email.service';
import { ProfilesService } from '../../profiles/services/profiles.service';
import { I18nContext } from 'nestjs-i18n';
import { UserFilter } from '../interfaces/user.filter';
import { LocationService } from 'src/location/service/location.service';
import { SegmentService } from 'src/segment/services/segment.service';
import { ActivitesService } from 'src/activities/services/activite.service';
import { InstitutionService } from 'src/institution/services/institution.service';

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
        private readonly locationService: LocationService,
        private readonly activitesService: ActivitesService,
        private readonly segmentService: SegmentService,
        private readonly institutionsService: InstitutionService) { }

    async findAll(filter: UserFilter, pageOptions: PaginationMetadataDto): Promise<User[]> {
        let whereClause: any = {};
        let orderClause: { [key: string]: string } = {};

        if (filter.id) {
            whereClause.id = filter.id;
        }
        if (filter.name) {
            whereClause = [
                { name: Like(`%${filter.name}%`) },
                { lastName: Like(`%${filter.name}%`) }
            ];
        }
        if (filter.cpfCnpj) {
            whereClause.cpfCnpj = filter.cpfCnpj;
        }
        if (filter.email) {
            whereClause.email = filter.email;
        }
        if (filter.roleId) {
            whereClause.role = await this.rolesService.findOne(filter.roleId);
        }

        if (filter.by && filter.order) {
            orderClause[filter.by] = filter.order;
        }

        let parameters: FindManyOptions<User> = {
            where: whereClause,
            order: orderClause,
            take: pageOptions.itemsPerPage ? pageOptions.itemsPerPage : 999
        }

        return await this.usersRepository.find(parameters);
    }

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
            // TODO: update pending
            // filters.where = nameFilters;
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
        return this.usersRepository.findOne({ where: { id: userId } });
    }

    async findByEmail(email: string) {
        return this.usersRepository.findOne({ where: { email: email } });
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

        const filters: FindManyOptions<User> = {
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

    async create(createUserDto: CreateUserDto): Promise<UserDto> {
        try {
            if (await this.usersRepository.findOne({ where: { email: createUserDto.email.toLocaleLowerCase() } })) {
                throw new Error('Email já utilizado.');
            }

            if (await this.usersRepository.findOne({ where: { cpfCnpj: createUserDto.cpfCnpj } })) {
                throw new Error('CPF/CNPJ já utilizado.');
            }

            const newUser = new User();
            newUser.active = true;
            newUser.name = createUserDto.name;
            newUser.lastName = createUserDto.lastName;
            newUser.acceptedPrivacyPolicy = createUserDto.acceptedPrivacyPolicy;
            newUser.acceptedTermsOfUse = createUserDto.acceptedTermsOfUse;
            newUser.password = await this.utilService.generateHash(createUserDto.password);
            newUser.email = createUserDto.email.toLowerCase();
            newUser.cpfCnpj = createUserDto.cpfCnpj;
            newUser.subscriptionId = createUserDto.subscriptionId;
            newUser.background = createUserDto.background;
            newUser.targetValue = createUserDto.targetValue;

            if (createUserDto.state) {
                newUser.state = await this.locationService.findState(+createUserDto.state);
            }

            if (createUserDto.abrangency) {
                newUser.abrangency = await this.locationService.findAllStates({
                    ids: createUserDto.abrangency.length == 1 && createUserDto.abrangency[0] == 0 ? null : createUserDto.abrangency,
                    name: null,
                    abbreviation: null,
                    country: null,
                    by: null,
                    order: null
                },
                {
                    itemsPerPage: 99999,
                    totalPages: 9999,
                    currentPage: 0
                });
            }

            if (createUserDto.activite) {
                newUser.activite = await this.activitesService.findAll({
                    ids: createUserDto.activite,
                    name: null,
                    by: null,
                    order: null
                },
                    {
                        itemsPerPage: 99999,
                        totalPages: 9999,
                        currentPage: 0
                    });
            }

            if (createUserDto.institutions) {
                newUser.institutions = (await this.institutionsService.dropdownList()).filter(i => createUserDto.institutions.includes(i.id));
            }

            if (createUserDto.segment) {
                newUser.segment = await this.segmentService.findOne(createUserDto.segment);
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
            this.validateEmailRequest(savedUser);
            return <UserDto>{};
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }
    async update(updateUserDto: UpdateUserDto, id: string) {
        const user = await this.usersRepository.findOne({ where: { id: +id } })
        let userReference: User;
        if (!user) {
            throw new NotFoundException(
                await I18nContext.current().translate('user.NOT_FOUND', {
                    args: { id: id },
                })
            )
        }

        if (updateUserDto.email) {
            userReference = await this.usersRepository.findOne({ where: { email: updateUserDto.email.toLowerCase() } });
            if (userReference && userReference.id != user.id) {
                throw new Error('Email já utilizado.');
            }
        }

        if (updateUserDto.cpfCnpj) {
            userReference = await this.usersRepository.findOne({ where: { cpfCnpj: updateUserDto.cpfCnpj } })
            if (userReference && userReference.id != user.id) {
                throw new Error('CPF/CNPJ já utilizado.');
            }
        }

        user.name = updateUserDto.name;
        user.lastName = updateUserDto.lastName;
        user.email = updateUserDto.email.toLowerCase();
        user.cpfCnpj = updateUserDto.cpfCnpj;

        if (updateUserDto.abrangency) {
            user.abrangency = await this.locationService.findAllStates({
                ids: updateUserDto.abrangency,
                name: null,
                abbreviation: null,
                country: null,
                by: null,
                order: null
            },
                {
                    itemsPerPage: 99999,
                    totalPages: 9999,
                    currentPage: 0
                });
        }

        if (updateUserDto.activite) {
            user.activite = await this.activitesService.findAll({
                ids: updateUserDto.activite,
                name: null,
                by: null,
                order: null
            }, {
                itemsPerPage: 99999,
                totalPages: 9999,
                currentPage: 0
            });
        }

        if (updateUserDto.segment) {
            user.segment = await this.segmentService.findOne(updateUserDto.segment);
        }

        //user.language = updateUserDto.language

        /*if (updateUserDto.collaborator) {
             user.collaborator = await this.collaboratorService.findOne(updateUserDto.collaborator)
         }
         if (updateUserDto.role) {
             user.role = await this.rolesService.findOne(updateUserDto.role)
         }
         if (updateUserDto.profile) {
             user.profile = await this.profilesService.getByKey(updateUserDto.profile)
         } */
        this.usersRepository.save(user)

        return <UpdateUserDto>{
            id: user.id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            cpfCnpj: user.cpfCnpj
        }
    }

    async delete(id: string, auditEntry: AudityEntryDto) {
        const user = await this.usersRepository.findOne({ where: { id: +id } })

        if (!user) {
            throw new NotFoundException(
                await I18nContext.current().translate('user.NOT_FOUND', {
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
        const user = await this.findByEmail(recoverPasswordDto.username);

        if (user) {

            const pr = new PasswordRecovery();
            pr.user = user;
            pr.token = await this.utilService.generateHash(user.email + new Date().getMilliseconds());

            this.passwordRecoveryService.invalidateUsersPastRecoveryRequest(pr);
            this.passwordRecoveryService.createPasswordRecoveryRequest(pr);

            if (!user.passwordRecovery) {
                user.passwordRecovery = [];
            }

            user.passwordRecovery.push(pr);
            await this.usersRepository.save(user);
            this.requestFirstAccess(user);
            return pr;
        } else {
            throw new HttpException('Email não cadastrado', HttpStatus.BAD_REQUEST);
        }
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

        const user = await this.usersRepository.findOne({ where: { id: changePasswordDto.userId } });
        user.password = await this.utilService.generateHash(changePasswordDto.newPassword);

        this.usersRepository.save(user);
        return true;
    }

    async updateRefreshToken(userId: number, refreshToken: string) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (user) {
            user.refreshToken = refreshToken;
            this.usersRepository.save(user);
        }
    }

    async requestFirstAccess(user: User): Promise<void> {
        if (user) {
            const firstAccessRequest = new FirstAccess();
            firstAccessRequest.user = user;
            const token = await (await this.utilService.generateHash(user.email + new Date().getMilliseconds()))
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

    async validateEmailRequest(user: User): Promise<void> {
        if (user) {
            const firstAccessRequest = new FirstAccess();
            firstAccessRequest.user = user;
            const token = await (await this.utilService.generateHash(user.email + new Date().getMilliseconds()))
            firstAccessRequest.token = token.replace(/[^a-zA-Z0-9 ]/g, '');

            this.firstAccessService.create(firstAccessRequest);

            if (!user.firstAccess) {
                user.firstAccess = [];
            }

            user.firstAccess.push(firstAccessRequest);
            await this.usersRepository.save(user);

            this.emailService.sendEmailValidateEmail(firstAccessRequest);
        }
    }

    async createPasswordFirstAccess(createPasswordDto: CreatePasswordDto): Promise<boolean> {
        const firstAccessRequest = await this.firstAccessService.findByToken(createPasswordDto.token);

        if (firstAccessRequest) {
            firstAccessRequest.user.password = await this.utilService.generateHash(createPasswordDto.password);
            firstAccessRequest.user.emailVerified = true;
            await this.usersRepository.save(firstAccessRequest.user);
            await this.firstAccessService.invalidateRequest(firstAccessRequest);
            return true;
        }
        return false;
    }

    async validateEmail(token: string): Promise<boolean> {
        const firstAccessRequest = await this.firstAccessService.findByToken(token);
        if (firstAccessRequest) {
            firstAccessRequest.user.emailVerified = true;
            await this.usersRepository.save(firstAccessRequest.user);
            await this.firstAccessService.invalidateRequest(firstAccessRequest);
            return true;
        }
        return false;
    }

    async updateProfileImage(userId: number, imageId: string) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (user) {
            user.profileImageId = imageId;
            this.usersRepository.save(user);
        }
    }

    async checkAvailabilityEmail(email: string): Promise<boolean> {
        const emailOccurencies = await this.usersRepository.count({ where: { email: email.toLowerCase() } });
        return emailOccurencies == 0;
    }

    async checkAvailabilityCpfCnpj(cpfCnpj: string): Promise<boolean> {
        const cpfCnpjOccurencies = await this.usersRepository.count({ where: { cpfCnpj: cpfCnpj } });
        return cpfCnpjOccurencies == 0;
    }
}