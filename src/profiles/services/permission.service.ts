import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { I18nRequestScopeService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { Permission } from '../entity/permission.entity';

@Injectable()
export class PermissionService {

    constructor(
        @Inject('PERMISSION_REPOSITORY')
        private repository: Repository<Permission>,
        private readonly i18n: I18nRequestScopeService,
    ) { }

    async getAll(): Promise<Permission[]> {
        return await this.repository.find({
            where: { active: true }
        });
    }

    async getById(id: number): Promise<Permission> {
        const permission = await this.repository.findOne(id);

        if (!permission) {
            throw new NotFoundException(
                await this.i18n.translate('permission.NOT_FOUND', { args: { id: id } })
            );
        }

        return permission;
    }

}