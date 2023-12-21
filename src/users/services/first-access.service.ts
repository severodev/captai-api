import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { I18nRequestScopeService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { FirstAccess } from '../entity/first-access.entity';

@Injectable()
export class FirstAccessService {

    constructor(
        @Inject('FIRST_ACCESS_REPOSITORY')
        private repository: Repository<FirstAccess>,
        private readonly i18n: I18nRequestScopeService
    ) { }

    async findByUser(userId: number): Promise<FirstAccess> {
        return await this.repository.findOne({
            where: { user: userId, valid: true },
        });
    }

    async findByToken(token: string): Promise<FirstAccess> {
        const firstAccess: FirstAccess = await this.repository.findOne({
            where: { token, valid: true },
            relations: ['user'],
        });

        if (!firstAccess) {
            throw new BadRequestException(await this.i18n.translate('first_access.INVALID'));
        }

        if (firstAccess.expiration.getTime() < new Date().getTime()) {
            this.invalidateRequest(firstAccess);
            throw new BadRequestException(await this.i18n.translate('first_access.INVALID'));
        }

        return firstAccess;
    }

    async create(firstAccess: Partial<FirstAccess>): Promise<FirstAccess> {
        const lastRequest = await this.findByUser(firstAccess.user.id);

        if (lastRequest) {
            lastRequest.valid = false;
            this.repository.save(lastRequest);
        }

        return await this.repository.save(firstAccess);
    }

    async invalidateRequest(firstAccess: FirstAccess): Promise<FirstAccess> {
        firstAccess.valid = false;
        return this.repository.save(firstAccess);
    }

}