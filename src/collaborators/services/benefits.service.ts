import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { classToPlain } from 'class-transformer';
import { I18nContext } from 'nestjs-i18n';
import { FindManyOptions, Repository } from 'typeorm';
import { Institute } from '../../institutes/entity/institute.entity';
import { BenefitModel } from '../entity/benefit-model.entity';
import { BenefitType } from '../entity/benefit-type.entity';
import { Benefit } from '../entity/benefit.entity';
import { Collaborator } from '../entity/collaborator.entity';
import { PayRoll } from '../entity/payroll.entity';
import { BenefitTypeDto } from '../interfaces/benefit-type.dto';
import { BenefitDto } from '../interfaces/benefit.dto';
import { CreateBenefitDto } from '../interfaces/create-benefit.dto';
import { AudityEntryDto } from './../../audit/interface/audit-entry.dto';
import { AuditService } from './../../audit/service/audit.service';

@Injectable()
export class BenefitsService {
  constructor(
    @Inject('BENEFITS_REPOSITORY')
    private benefitsRepository: Repository<Benefit>,
    @Inject('BENEFITS_MODEL_REPOSITORY')
    private benefitsModelRepository: Repository<BenefitModel>,
    @Inject('BENEFITS_TYPE_REPOSITORY')
    private benefitsTypeRepository: Repository<BenefitType>,
    @Inject('PAYROLL_REPOSITORY')
    private payrollRepository: Repository<PayRoll>,
    private readonly auditService: AuditService
  ) { }

  async dropdown(): Promise<BenefitTypeDto[]> {
    const filters: FindManyOptions<BenefitType> = {
      order: {
        id: "ASC"
      }
    };
    return (await this.benefitsTypeRepository.find(filters))
      .map(bt => <BenefitTypeDto>{
        id: bt.id,
        code: bt.code,
        name: bt.name,
        custom: bt.custom
      });
  }

  async findByIds(ids: number[]): Promise<Benefit[]> {
    return await this.benefitsRepository.findByIds(ids);
  }

  async allTypes(): Promise<BenefitType[]> {
    return await this.benefitsTypeRepository.find();
  }

  async models(idER: number, idInstitute: number): Promise<Benefit[]> {
    const filters: FindManyOptions<BenefitModel> = {
      where: {        
        institute: +idInstitute,
        employmentRelationship: +idER
      },
      order: {
        benefitType: "ASC"
      },
      relations: ['institute', 'employmentRelationship', 'benefitType']
    };

    const benefitsModels = await this.benefitsModelRepository.find(filters);

    return benefitsModels.map(bm => <Benefit>{
      benefitType: bm.benefitType,
      description: bm.description,
      comments: bm.comments,
      amountType: bm.amountType,
      amountValue: bm.amountValue,
      deductionType: bm.deductionType,
      deductionValue: bm.deductionValue      
    });
  }

  async create(createBenefitDto: CreateBenefitDto, auditEntry: AudityEntryDto, i18n: I18nContext): Promise<BenefitDto> {

    const dbEntity = new Benefit();

    dbEntity.benefitType = new BenefitType();
    dbEntity.benefitType.id = createBenefitDto.benefitType.id;

    // dbEntity.collaborator = new Collaborator();
    // dbEntity.collaborator.id = createBenefitDto.collaboratorId;

    dbEntity.institute = new Institute();
    dbEntity.institute.id = createBenefitDto.instituteId;

    dbEntity.description = createBenefitDto.description;
    dbEntity.amountType = createBenefitDto.amountType;
    dbEntity.amountValue = createBenefitDto.amountValue;
    dbEntity.deductionType = createBenefitDto.deductionType;
    dbEntity.deductionValue = createBenefitDto.deductionValue;

    this.benefitsRepository.create(dbEntity);
    await this.benefitsRepository.save(dbEntity);

    if (auditEntry) {
      auditEntry.actionType = 'CREATE';
      auditEntry.targetEntity = this.benefitsRepository.metadata.targetName;
      auditEntry.targetTable = this.benefitsRepository.metadata.tableName;
      auditEntry.targetEntityId = dbEntity.id;
      auditEntry.targetEntityBody = JSON.stringify(classToPlain(dbEntity));
      this.auditService.audit(auditEntry);
    }

    return <BenefitDto>{
      id: dbEntity.id,
      amountType: dbEntity.amountType,
      amountValue: dbEntity.amountValue,
      deductionType: dbEntity.deductionType,
      deductionValue: dbEntity.deductionValue,
      collaboratorId: createBenefitDto.collaboratorId,
      instituteId: createBenefitDto.instituteId,
      projectId: createBenefitDto.projectId,
      benefitType: <BenefitTypeDto>{
        id: dbEntity.benefitType.id,
        code: dbEntity.benefitType.code,
        name: dbEntity.benefitType.name,
        custom: dbEntity.benefitType.custom
      },
    };
  }

  async update(updateBenefitDto: BenefitDto, auditEntry: AudityEntryDto, i18n: I18nContext): Promise<BenefitDto> {

    const dbEntity = await this.benefitsRepository.findOne(updateBenefitDto.id, {relations: ['collaborator', 'project', 'institute']});

    if (!dbEntity) {
      throw new NotFoundException(
        await i18n.translate('benefit.NOT_FOUND', {
          args: { id: updateBenefitDto.id },
        })
      );
    }

    dbEntity.description = updateBenefitDto.description;
    dbEntity.amountType = updateBenefitDto.amountType;
    dbEntity.amountValue = updateBenefitDto.amountValue;
    dbEntity.deductionType = updateBenefitDto.deductionType;
    dbEntity.deductionValue = updateBenefitDto.deductionValue;

    await this.benefitsRepository.save(dbEntity);

    if (auditEntry) {
      auditEntry.actionType = 'UPDATE';
      auditEntry.targetEntity = this.benefitsRepository.metadata.targetName;
      auditEntry.targetTable = this.benefitsRepository.metadata.tableName;
      auditEntry.targetEntityId = dbEntity.id;
      auditEntry.targetEntityBody = JSON.stringify(classToPlain(dbEntity));
      this.auditService.audit(auditEntry);
    }

    return <BenefitDto>{
      id: dbEntity.id,
      amountType: dbEntity.amountType,
      amountValue: dbEntity.amountValue,
      deductionType: dbEntity.deductionType,
      deductionValue: dbEntity.deductionValue,
      // collaboratorId: dbEntity.collaborator.id,
      instituteId: dbEntity.institute.id,
      projectId: dbEntity.project.id,
      benefitType: <BenefitTypeDto>{
        id: dbEntity.benefitType.id,
        code: dbEntity.benefitType.code,
        name: dbEntity.benefitType.name,
        custom: dbEntity.benefitType.custom
      },
    };
  }

  async grantedTypes(idInstitute: number, idER: number): Promise<BenefitTypeDto[]> {
    const benefitsTypes = await this.benefitsTypeRepository.find({
      join: { alias: 'benefitType', innerJoin: { grant: 'benefitType.grants' } },
      where: qb => {
        qb.where({ active: true });
        qb.andWhere('grant.institute = :_instituteId', { _instituteId: idInstitute });
        qb.andWhere('grant.employmentRelationship = :_erId', { _erId: idER });
      }
    }
    );
    const benefits = benefitsTypes.map(b => <BenefitTypeDto>{
      id: b.id,
      code: b.code,
      name: b.name,
      custom: b.custom
    });

    return benefits;
  }
  
  async buildGrantedBenefits(idPayroll: number, idEmploymentRelationship: number, idInstitute: number) : Promise<BenefitDto[]> {

    let benefits:Benefit[] = await this.models(idEmploymentRelationship, idInstitute);

    const payroll:PayRoll = idPayroll && idPayroll > 0 && await this.payrollRepository.findOne(idPayroll);
    if(payroll && payroll.benefits){
      benefits = benefits.filter(nb => !payroll.benefits.find(pb => pb.benefitType.id == nb.benefitType.id));
    }

    return benefits.map(b => <BenefitDto>{      
      benefitType: <BenefitTypeDto>{
        id: b.benefitType.id,
        code: b.benefitType.code,
        name: b.benefitType.name,
        description: b.benefitType.description,
        custom: b.benefitType.custom
      },
      description: b.description,
      hint: b.comments,
      comments: '',
      amountType: b.amountType,
      amountValue: b.amountValue,
      deductionType: b.deductionType,
      deductionValue: b.deductionValue,
    });
  }

  async deleteBenefits(benefitIds: number[]): Promise<void> {
    await this.benefitsRepository.delete(benefitIds);
  }

}