import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { AudityEntryDto } from '../../audit/interface/audit-entry.dto';
import { AuditService } from '../../audit/service/audit.service';
import { ExpenseInstallment } from '../entity/expense-installment.entity';

@Injectable()
export class ExpenseService {

    constructor(
        @Inject('EXPENSES_INSTALLMENT_REPOSITORY')
        private expensesInstallmentRepository: Repository<ExpenseInstallment>,
        private readonly auditService: AuditService
    ) { }

    async findOne(expenseInstallmentId: number): Promise<ExpenseInstallment> {
        return this.expensesInstallmentRepository.findOne(expenseInstallmentId);
    }

    async findByExpense(expenseId: number): Promise<ExpenseInstallment[]> {
        return this.expensesInstallmentRepository.find({where: { expense: expenseId }});
    }

    async delete(expenseInstallmentId: number, i18n: I18nContext, auditEntry: AudityEntryDto): Promise<boolean> {

        const dbEntity = await this.findOne(expenseInstallmentId);

        if (!dbEntity) {
            throw new NotFoundException(
                await i18n.translate('expense.INSTALLMENTS.NOT_FOUND', {
                    args: { id: expenseInstallmentId },
                })
            );
        }

        const result = await this.expensesInstallmentRepository.delete(dbEntity);

        if (auditEntry) {
            auditEntry.actionType = 'DELETE';
            auditEntry.targetEntity = this.expensesInstallmentRepository.metadata.targetName;
            auditEntry.targetTable = this.expensesInstallmentRepository.metadata.tableName;
            auditEntry.targetEntityId = dbEntity.id;
            auditEntry.targetEntityBody = '';
            this.auditService.audit(auditEntry);
        }

        return result.affected > 0;
    }

}
