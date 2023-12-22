import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Permission } from '../entity/permission.entity';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class PermissionService {

    constructor(
        @Inject('PERMISSION_REPOSITORY')
        private repository: Repository<Permission>,
    ) { }

    async getAll(): Promise<Permission[]> {
        return await this.repository.find({
            where: { active: true }
        });
    }

    async getById(id: number): Promise<Permission> {
        const permission = await this.repository.findOne({where: { id: id }});

        if (!permission) {
            throw new NotFoundException(
                await I18nContext.current().translate('permission.NOT_FOUND', { args: { id: id } })
            );
        }

        return permission;
    }

}