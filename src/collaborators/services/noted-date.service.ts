import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AudityEntryDto } from '../../audit/interface/audit-entry.dto';
import { Between, FindManyOptions, Repository } from 'typeorm';
import { Benefit } from '../entity/benefit.entity';
import { BenefitDropdownDto } from '../interfaces/benefit-dropdown.dto';
import { BenefitDto } from '../interfaces/benefit.dto';
import { CreateBenefitDto } from '../interfaces/create-benefit.dto';
import { classToPlain, plainToClass } from 'class-transformer';
import { diff } from 'deep-object-diff';
import { AuditService } from '../../audit/service/audit.service';
import { I18nContext } from 'nestjs-i18n';
import { NotedDate } from '../entity/noted-date.entity';
import { NotedDateEnum } from '../enums/noted-date.enum';

@Injectable()
export class NotedDateService {
  constructor(
    @Inject('NOTED_DATE_REPOSITORY')
    private notedDateRepository: Repository<NotedDate>,
    private readonly auditService: AuditService
  ) { }

  async findByRange(start: Date, end: Date): Promise<NotedDate[]> {
    return await this.notedDateRepository.find({where: {notedDate: Between(start, end)}});
  }

  async holidaysInRange(start: Date, end: Date): Promise<NotedDate[]> {
    return await this.notedDateRepository.find({where: {type: NotedDateEnum.HOLIDAY, notedDate: Between(start, end)}});
  }

  async create(createNotedDateDto: CreateBenefitDto, auditEntry: AudityEntryDto, i18n: I18nContext): Promise<BenefitDto> {

    // const newBenefit = new Benefit();
    // newBenefit.active = true;
    // newBenefit.name = createBenefitDto.name;
    // newBenefit.description = createBenefitDto.description;
    // newBenefit.amountType = createBenefitDto.amountType;
    // newBenefit.amountValue = createBenefitDto.amountValue;
    // newBenefit.deductionType = createBenefitDto.deductionType;
    // newBenefit.deductionValue = createBenefitDto.deductionValue;

    // this.benefitsRepository.create(newBenefit);
    // await this.benefitsRepository.save(newBenefit);

    // if (auditEntry) {
    //   auditEntry.actionType = 'CREATE';
    //   auditEntry.targetEntity = this.benefitsRepository.metadata.targetName;
    //   auditEntry.targetTable = this.benefitsRepository.metadata.tableName;
    //   auditEntry.targetEntityId = newBenefit.id;
    //   auditEntry.targetEntityBody = JSON.stringify(classToPlain(newBenefit));
    //   this.auditService.audit(auditEntry);
    // }

    // return <BenefitDto>{
    //   ...newBenefit,
    // };

    return null;
  }

  async update(updateBenefitDto: BenefitDto, auditEntry: AudityEntryDto, i18n: I18nContext): Promise<BenefitDto> {

    // const dbBenefit = await this.benefitsRepository.findOne(updateBenefitDto.id);

    // if (!dbBenefit) {
    //   throw new NotFoundException(
    //     await i18n.translate('benefit.NOT_FOUND', {
    //       args: { id: updateBenefitDto.id },
    //     })
    //   );
    // }

    // dbBenefit.name = updateBenefitDto.name;
    // dbBenefit.description = updateBenefitDto.description;
    // dbBenefit.amountType = updateBenefitDto.amountType;
    // dbBenefit.amountValue = updateBenefitDto.amountValue;
    // dbBenefit.deductionType = updateBenefitDto.deductionType;
    // dbBenefit.deductionValue = updateBenefitDto.deductionValue;

    // await this.benefitsRepository.save(dbBenefit);

    // if (auditEntry) {
    //   auditEntry.actionType = 'UPDATE';
    //   auditEntry.targetEntity = this.benefitsRepository.metadata.targetName;
    //   auditEntry.targetTable = this.benefitsRepository.metadata.tableName;
    //   auditEntry.targetEntityId = dbBenefit.id;
    //   auditEntry.targetEntityBody = JSON.stringify(classToPlain(dbBenefit));
    //   this.auditService.audit(auditEntry);
    // }

    // return <BenefitDto>{
    //   ...dbBenefit,
    // };

    return null;
  }

}