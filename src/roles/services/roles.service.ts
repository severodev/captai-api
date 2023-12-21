import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Role } from '../role.entity';

@Injectable()
export class RolesService {

    constructor(
        @Inject('ROLES_REPOSITORY')
        private rolesRepository: Repository<Role>,
    ) { }

    async findAll(): Promise<Role[]> {
        return this.rolesRepository.find();
    }

    async findOne(id: number): Promise<Role> {
        return this.rolesRepository.findOne({ where: { id: id } });
    }

}
