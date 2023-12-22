import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { FirstAccess } from '../entity/first-access.entity';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class FirstAccessService {

    constructor(
        @Inject('FIRST_ACCESS_REPOSITORY')
        private repository: Repository<FirstAccess>,
    ) { }

    async findByUser(userId: number): Promise<FirstAccess> {
        return await this.repository.findOne({
            where: { user: { id: userId }, valid: true },
        });
    }

    async findByToken(token: string): Promise<FirstAccess> {
        const firstAccess: FirstAccess = await this.repository.findOne({
            where: { token, valid: true },
            relations: ['user'],
        });

        if (!firstAccess) {
            throw new BadRequestException(await I18nContext.current().translate('first_access.INVALID'));
        }

        if (firstAccess.expiration.getTime() < new Date().getTime()) {
            this.invalidateRequest(firstAccess);
            throw new BadRequestException(await I18nContext.current().translate('first_access.INVALID'));
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