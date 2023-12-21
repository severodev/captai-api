import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { classToPlain } from 'class-transformer';
import { I18nRequestScopeService } from 'nestjs-i18n';
import { Repository } from "typeorm";
import { AudityEntryDto } from '../../audit/interface/audit-entry.dto';
import { AuditService } from '../../audit/service/audit.service';
import { Bank } from '../entity/bank.entity';
import { BankDropdownDto } from '../interfaces/bank-dropdown.dto';
import { BankDto } from '../interfaces/bank.dto';
import { CreateBankDto } from '../interfaces/create-bank.dto';

@Injectable()
export class BankService {

    constructor(
        @Inject('BANK_REPOSITORY')
        private bankRepository: Repository<Bank>,
        private readonly auditService: AuditService,
        private readonly i18n: I18nRequestScopeService
    ) { }

    async dropdown(): Promise<BankDropdownDto[]> {
        return (await this.bankRepository.find({
            order: {
                name: "ASC"
            },
        })).map(b => <BankDropdownDto>{
            id: b.id,
            code: b.code,
            name: b.name
        });
    }

    async findOne(id: number): Promise<Bank> {
        return this.bankRepository.findOne({ id });
    }

    async create(createBankDto: CreateBankDto, auditEntry: AudityEntryDto): Promise<BankDto> {

        const newEntity = new Bank();
        newEntity.name = createBankDto.name;
        newEntity.code = createBankDto.code;

        this.bankRepository.create(newEntity);
        await this.bankRepository.save(newEntity);

        if (auditEntry) {
            auditEntry.actionType = 'CREATE';
            auditEntry.targetEntity = this.bankRepository.metadata.targetName;
            auditEntry.targetTable = this.bankRepository.metadata.tableName;
            auditEntry.targetEntityId = newEntity.id;
            auditEntry.targetEntityBody = JSON.stringify(classToPlain(newEntity));
            this.auditService.audit(auditEntry);
        }
        return <BankDto>{
            id: newEntity.id,
            code: newEntity.code,
            name: newEntity.name
        };
    }

    async update(bankDto: BankDto, auditEntry: AudityEntryDto): Promise<BankDto> {

        if (!bankDto.id || bankDto.id <= 0) {
            throw new BadRequestException(
                await this.i18n.translate('validation.MISSING_ID')
            );
        }

        const dbEntity = await this.bankRepository.findOne(bankDto.id);
        dbEntity.name = bankDto.name;
        dbEntity.code = bankDto.code;

        await this.bankRepository.save(dbEntity);

        if (auditEntry) {
            auditEntry.actionType = 'UPDATE';
            auditEntry.targetEntity = this.bankRepository.metadata.targetName;
            auditEntry.targetTable = this.bankRepository.metadata.tableName;
            auditEntry.targetEntityId = dbEntity.id;
            auditEntry.targetEntityBody = JSON.stringify(classToPlain(dbEntity));
            this.auditService.audit(auditEntry);
        }
        return <BankDto>{
            id: dbEntity.id,
            code: dbEntity.code,
            name: dbEntity.name
        };
    }

    async delete(bankId: number, auditEntry: AudityEntryDto): Promise<boolean> {

        if (!bankId || bankId <= 0) {
            throw new BadRequestException(
                await this.i18n.translate('validation.MISSING_ID')
            );
        }

        let dbEntity = await this.findOne(bankId);

        if (!dbEntity) {
            throw new NotFoundException(
                await this.i18n.translate('bank.NOT_FOUND', {
                    args: { id: bankId },
                })
            );
        }

        dbEntity.active = false;
        dbEntity = await this.bankRepository.save(dbEntity);

        if (auditEntry) {
            auditEntry.actionType = 'DELETE';
            auditEntry.targetEntity = this.bankRepository.metadata.targetName;
            auditEntry.targetTable = this.bankRepository.metadata.tableName;
            auditEntry.targetEntityId = dbEntity.id;
            auditEntry.targetEntityBody = '';
            this.auditService.audit(auditEntry);
        }

        return dbEntity.active === false;
    }

    async activate(bankId: number, auditEntry: AudityEntryDto): Promise<boolean> {

        if (!bankId || bankId <= 0) {
            throw new BadRequestException(
                await this.i18n.translate('validation.MISSING_ID')
            );
        }

        let dbEntity = await this.findOne(bankId);

        if (!dbEntity) {
            throw new NotFoundException(
                await this.i18n.translate('bank.NOT_FOUND', {
                    args: { id: bankId },
                })
            );
        }

        dbEntity.active = true;
        dbEntity = await this.bankRepository.save(dbEntity);

        if (auditEntry) {
            auditEntry.actionType = 'ACTIVATE';
            auditEntry.targetEntity = this.bankRepository.metadata.targetName;
            auditEntry.targetTable = this.bankRepository.metadata.tableName;
            auditEntry.targetEntityId = dbEntity.id;
            auditEntry.targetEntityBody = '';
            this.auditService.audit(auditEntry);
        }

        return dbEntity.active === true;
    }

}
