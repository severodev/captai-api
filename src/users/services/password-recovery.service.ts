import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UpdatePasswordDto } from '../../auth/interfaces/update-password.dto';
import { PasswordRecovery } from './../entity/password-recovery.entity';

@Injectable()
export class PasswordRecoveryService {

    constructor(
        @Inject('PASSWORD_RECOVERY_REPOSITORY')
        private passwordRecoveryRepository: Repository<PasswordRecovery>,
    ) { }

    async invalidateUsersPastRecoveryRequest(pr: PasswordRecovery) {
        // SINTAX: first object = where clause; second object = udpate values
        return this.passwordRecoveryRepository.update({ user: pr.user, used: false },{ invalidated: true});
    }

    async createPasswordRecoveryRequest(pr: PasswordRecovery) {
        return this.passwordRecoveryRepository.save(pr);
    }

    async findPasswordRecoveryRequest(token: string) {
        return this.passwordRecoveryRepository.findOne({
            where: { token: token, invalidated: false },
            relations: ["user"]
        });
    }

    async checkRecoveryTokenValidity(updatePasswordDto: UpdatePasswordDto): Promise<PasswordRecovery> {
        const pr = await this.findPasswordRecoveryRequest(updatePasswordDto.token);

        console.log(pr);
        if (pr && pr.used === false && pr.expiration >= new Date()) {
            return pr;
        }

        return null;
    }

}