import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { I18nRequestScopeService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { Permission } from '../entity/permission.entity';
import { Profile } from '../entity/profile.entity';

@Injectable()
export class ProfilesService {

    constructor(
        @Inject('PROFILE_REPOSITORY')
        private repository: Repository<Profile>,
        private readonly i18n: I18nRequestScopeService,
    ) { }

    async getAll(): Promise<Profile[]> {
        return await this.repository.find({
            where: { active: true },
            relations: ['permissions'],
        });
    }

    async getById(id: number): Promise<Profile> {
        const profile = await this.repository.findOne({
            where: { id },
            relations: ['permissions'],
        });

        if (!profile) {
            throw new NotFoundException(await this.i18n.translate('profile.NOT_FOUND'));
        }

        return profile;
    }

    async getByKey(key: string): Promise<Profile> {
        const profile = await this.repository.findOne({
            where: { key },
            relations: ['permissions'],
        });

        if (!profile) {
            throw new NotFoundException(await this.i18n.translate('profile.NOT_FOUND'));
        }

        return profile;
    }

    async updatePermissions(id: number, permissions: Permission[]): Promise<Profile> {
        const profile = await this.getById(id);
        profile.permissions = permissions;
        return await this.repository.save(profile);
    }
}
