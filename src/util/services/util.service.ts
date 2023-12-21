import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from "bcrypt";
import { Repository } from 'typeorm';
import { ApplicationSettings } from '../entity/api-settings.entity';

@Injectable()
export class UtilService {

    constructor(
        private readonly configService: ConfigService,
        @Inject('SETTINGS_REPOSITORY')
        private settingsRepository: Repository<ApplicationSettings>,) { }

    async generateHash(phrase: string): Promise<string> {
        return bcrypt.hashSync(phrase,
            parseInt(this.configService.get('BCRYPT_SALT_ROUNDS')) || 10);
    }

    round(input: number, decimalLimit = 2): number {
        try {
            const c = input.toFixed(decimalLimit);
            return parseFloat(c);
        } catch (e) {
            return input;
        }
    }

    roundFromString(input: string, decimalLimit = 2): number {
        try {
            const n = parseFloat(input);
            return this.round(n, decimalLimit);
        } catch (e) {
            return -1;
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async findSettingsByKey(_key: any): Promise<string> {
        const result = await this.settingsRepository.findOne({ where: { key: _key.toString() } });
        return result.value;
    }
}
