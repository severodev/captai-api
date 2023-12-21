import { Injectable, Inject } from '@nestjs/common';
import { AuditEntry } from '../entity/audit-entry.entity';
import { Repository } from 'typeorm';
import { AudityEntryDto } from '../interface/audit-entry.dto';
import { User } from '../../users/entity/user.entity';

@Injectable()
export class AuditService {

    constructor(
        @Inject('AUDIT_REPOSITORY')
        private auditRepository: Repository<AuditEntry>,
    ) { }

    audit(entryDto: AudityEntryDto) {

        const { userId, ...entryData } = entryDto;
        const actionUser = new User();
        actionUser.id = userId;

        const entry = <AuditEntry>{
            user: actionUser,
            ...entryData
        };

        this.auditRepository.save(entry);
    }
}
