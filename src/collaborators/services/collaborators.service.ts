/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { classToPlain } from 'class-transformer';
import { mkConfig, generateCsv, download } from "export-to-csv";
import * as filesize from 'filesize';
import * as moment from 'moment-business-days';
import { I18nContext } from 'nestjs-i18n';
import { ProjectMemberService } from '../../projects/services/project-member.service';
import { Brackets, FindManyOptions, Raw, Repository } from 'typeorm';
import { Logger } from 'winston';
import { DocumentCategoryDto } from '../../documents/interfaces/document-category.dto';
import { FileManagementService } from '../../filemanagement/services/filemanagement.service';
import { Institute } from '../../institutes/entity/institute.entity';
import { InstituteDto } from '../../institutes/interfaces/institute.dto';
import { InstitutesService } from '../../institutes/services/institutes.service';
import { ProjectDto } from '../../projects/interfaces/project.dto';
import { ProjectsService } from '../../projects/services/projects.service';
import { BudgetCategoryDto } from '../../suppliers/interfaces/budget-category.dto';
import { BudgetCategoryService } from '../../suppliers/services/budgetCategory.service';
import { UtilService } from '../../util/services/util.service';
import { Benefit } from '../entity/benefit.entity';
import { CollaboratorMonthlyReport } from '../entity/collaborator-monthly-report.entity';
import { Collaborator } from '../entity/collaborator.entity';
import { Dependent } from '../entity/dependent.entity';
import { IRRFRule } from '../entity/irrf-rule.entity';
import { PaymentComponent } from '../entity/payment-component.entity';
import { Payment } from '../entity/payment.entity';
import { PayRollHistory } from '../entity/payroll-history.entity';
import { PayRoll } from '../entity/payroll.entity';
import { BenefitsEnum } from '../enums/benefits.enum';
import { EmploymentRelationshipEnum } from '../enums/employment-relationship-type.enum';
import { PaymentComponentEnum } from '../enums/payment-component.enum';
import { BenefitTypeDto } from '../interfaces/benefit-type.dto';
import { BenefitDto } from '../interfaces/benefit.dto';
import { CollaboratorCardDto } from '../interfaces/collaborator-card.dto';
import { CollaboratorCSVReport } from '../interfaces/collaborator-csv-report.dto';
import { CollaboratorDropdownDto } from '../interfaces/collaborator-dropdown.dto';
import { CollaboratorExportDto } from '../interfaces/collaborator-export.dto';
import { CollaboratorMonthlyReportDto } from '../interfaces/collaborator-monthly-report.dto';
import { CollaboratorDto } from '../interfaces/collaborator.dto';
import { CreateBenefitDto } from '../interfaces/create-benefit.dto';
import { CreateCollaboratorDto } from '../interfaces/create-collaborator.dto';
import { CreatePayRollDto } from '../interfaces/create-payroll.dto';
import { DependentDto } from '../interfaces/dependent.dto';
import { EmploymentRelationshipDto } from '../interfaces/employment-relationship.dto';
import { MonthReportItemDto } from '../interfaces/month-report-item.dto';
import { PayRollDto } from '../interfaces/payroll.dto';
import { UpdateCollaboratorDto } from '../interfaces/update-collaborator.dto';
import { AudityEntryDto } from './../../audit/interface/audit-entry.dto';
import { AuditService } from './../../audit/service/audit.service';
import { Document } from './../../documents/entity/document.entity';
import { DocumentTypeDto } from './../../documents/interfaces/document-type.dto';
import { DocumentDto } from './../../documents/interfaces/document.dto';
import { FileTypeDto } from './../../documents/interfaces/file-type.dto';
import { DocumentsService } from './../../documents/services/documents.service';
import { LocationService } from './../../location/service/location.service';
import { Project } from './../../projects/entity/project.entity';
import { PaginationMetadataDto } from './../../util/interfaces/pagination-metadata.dto';
import { BenefitsService } from './benefits.service';
import { EmploymentRelationshipService } from './employment-relationship.service';
import { NotedDateService } from './noted-date.service';
import { PayrollService } from './payroll.service';

moment.locale('pt-br');

enum paymentKeys {
  PAYROLL_DEFAULT_YEAR_DURATION_IN_MONTHS,
  PAYROLL_DEFAULT_MONTH_DURATION_IN_DAYS,
  CHARGE_CLT_MONTHLY,
  CHARGE_CLT_MONTHLY_FASTEF,
  BENEFIT_TRANSPORT_TICKET_VALUE,
  CHARGE_TRANSPORT_LIMIT_PERCENTAGE,
  CHARGE_TRANSPORT_LIMIT_VALUE,
  BENEFIT_MEALPLAN_VALUE,
  CHARGE_MEALPLAN_VALUE,
  BENEFIT_GAS_VALUE,
  BENEFIT_KINDERGARTEN_VALUE,
  CHARGE_HEALTHCARE_VALUE,
  BENEFIT_TRANSPORT_INTERNSHIP_FASTEF,
  CHARGE_RAW_RPA_INSS,
  CHARGE_RAW_RPA_ISS,
  CHARGE_RAW_RPA_EMPLOYER_INSS,
  BENEFIT_CHRISTMAS_BONUS_PERCENTAGE,
}

const ORIGINAL_PAYROLL_REASON = 'Original';

@Injectable()
export class CollaboratorsService {
  constructor(
    @Inject('COLLABORATORS_REPOSITORY')
    private collaboratorsRepository: Repository<Collaborator>,
    @Inject('COLLABORATORS_MONTHLY_REPORT_REPOSITORY')
    private collaboratorMonthlyReportRepository: Repository<
      CollaboratorMonthlyReport
    >,
    @Inject('IRRF_RULE_REPOSITORY')
    private irrfRuleRepository: Repository<IRRFRule>,
    private readonly locationService: LocationService,
    private readonly documentsService: DocumentsService,
    private readonly budgetCategoryService: BudgetCategoryService,
    private readonly fileManagementService: FileManagementService,
    private readonly payrollService: PayrollService,
    private readonly auditService: AuditService,
    private readonly erService: EmploymentRelationshipService,
    private readonly utilService: UtilService,
    private readonly projectService: ProjectsService,
    private readonly projectMemberService: ProjectMemberService,
    private readonly notedDateService: NotedDateService,
    private readonly instituteService: InstitutesService,
    private readonly benefitService: BenefitsService,
    @Inject('winston')
    private readonly logger: Logger,
  ) { }

  async pagination(
    search: string,
    itemsPerPage = 10,
    isActive: boolean,
    _filters: any,
  ): Promise<PaginationMetadataDto> {
    let _nameFilters = "";
    search.length > 0 && search.split(' ').forEach(s => {
      _nameFilters = _nameFilters + (_nameFilters.length > 0 ? ' OR ' + `collaborator.name ilike '%${s}%'` : '' + `collaborator.name ilike '%${s}%'`);
    });

    const _r = this.collaboratorsRepository
      .createQueryBuilder('collaborator')
      .leftJoinAndSelect('collaborator.payroll', 'payroll')
      .leftJoinAndSelect('payroll.institute', 'institute')
      .leftJoinAndSelect('payroll.project', 'project')
      .leftJoinAndSelect('payroll.employmentRelationship', 'er')
      .where('collaborator.active = :isActive', { isActive });

    if (_nameFilters.length > 0) {
      _r.andWhere(_nameFilters);
    }

    if (_filters) {
      if (_filters.er && _filters.er.length > 0) {
        _r.andWhere('er.id IN (:...ers)', {
          ers: _filters.er.split(',')
        });
      }

      if (_filters.institute &&
        _filters.institute.length > 0) {
        _r.andWhere('institute.id IN (:...institutes)', {
          institutes: _filters.institute.split(',')
        });
      }

      if (_filters.project && _filters.project.length > 0) {
        _r.andWhere('project.id IN (:...projects)', {
          projects: _filters.project.split(',')
        });
      }
    }

    const totalItems = await _r.getCount();

    const paginationMetadata: PaginationMetadataDto = {
      totalItems,
      itemsPerPage: +itemsPerPage, // weird stuff here, always returning string
      totalPages: Math.ceil(totalItems / itemsPerPage),
    };

    return paginationMetadata;
  }

  async filteredCards(
    stringSearch: string,
    orderby: string,
    desc: boolean,
    itemsPerPage: number,
    page: number,
    isActive: boolean,
    _filters: any,
  ): Promise<CollaboratorCardDto[]> {

    let _nameFilters = "";
    stringSearch.length > 0 && stringSearch.split(' ').forEach(s => {
      _nameFilters = _nameFilters + (_nameFilters.length > 0 ? ' OR ' + `collaborator.name ilike '%${s}%'` : '' + `collaborator.name ilike '%${s}%'`);
    });

    const _r = this.collaboratorsRepository
      .createQueryBuilder('collaborator')
      .leftJoinAndSelect('collaborator.payroll', 'payroll')
      .leftJoinAndSelect('payroll.institute', 'institute')
      .leftJoinAndSelect('payroll.project', 'project')
      .leftJoinAndSelect('payroll.employmentRelationship', 'er')
      .where('collaborator.active = :isActive', { isActive });

    if (_nameFilters.length > 0) {
      _r.andWhere(_nameFilters);
    }

    if (_filters) {
      if (_filters.er && _filters.er.length > 0) {
        _r.andWhere('er.id IN (:...ers)', {
          ers: _filters.er.split(',')
        });
      }

      if (_filters.institute &&
        _filters.institute.length > 0) {
        _r.andWhere('institute.id IN (:...institutes)', {
          institutes: _filters.institute.split(',')
        });
      }

      if (_filters.project && _filters.project.length > 0) {
        _r.andWhere('project.id IN (:...projects)', {
          projects: _filters.project.split(',')
        });
      }
    }

    if (orderby && orderby.length > 0) {
      _r.orderBy(orderby.includes('d') ? 'collaborator.created' : 'collaborator.name', desc ? 'DESC' : 'ASC');
    } else {
      _r.orderBy('collaborator.name', 'ASC');
    }

    _r.take(itemsPerPage);
    _r.skip((page > 0 ? page - 1 : 0) * itemsPerPage);

    const result = await _r.getMany();

    return result.map(
      c =>
        <CollaboratorCardDto>{
          id: c.id,
          name: c.name,
          socialName: c.socialName,
          job: c.jobTitle,
          image: c.image,
          gender: c.gender,
          employment: c.payroll
            .map(p => p.employmentRelationship.name)
            .join(' - '),
          dataPercentage:
            (100 *
              (23 +
                (c.activities != null ? 1 : 0) +
                c.payroll.reduce((sum, p) => {
                  return sum + (p.workload != null && p.workload > 0 ? 1 : 0);
                }, 0))) /
            (24 + (c.payroll.length == 0 ? 1 : c.payroll.length)),
        },
    );
  }

  async csv(
    search: string,
    orderby: string,
    desc: boolean,
    itemsPerPage: number,
    page: number,
    _filters: any,
    i18n: I18nContext,
  ): Promise<CollaboratorCSVReport> {
    const filters: FindManyOptions<Collaborator> = {
      take: itemsPerPage,
      skip: (page > 0 ? page - 1 : 0) * itemsPerPage,
      where: {
        active: true,
      },
    };
    if (orderby && orderby.length > 0) {
      filters.order = {
        [orderby.includes('d') ? 'created' : 'name']: desc ? 'DESC' : 'ASC',
      };
    } else {
      filters.order = {
        name: 'ASC',
      };
    }
    if (search && search.length > 0) {
      const nameFilters = search.split(' ').map(s => {
        return { name: Raw(alias => `${alias} ilike '%${s}%'`), active: true };
      });
      filters.where = nameFilters;
    }

    let result = await this.collaboratorsRepository.find({
      ...filters,
      relations: [
        'benefits',
        'dependents',
        'state',
        'city',
        'payroll',
        'payroll.employmentRelationship',
        'payroll.project',
        'payroll.institute',
      ],
    });

    if (_filters) {
      const ers =
        _filters.er && _filters.er.length > 0 && _filters.er.split(','),
        institutes =
          _filters.institute &&
          _filters.institute.length > 0 &&
          _filters.institute.split(','),
        projects =
          _filters.project &&
          _filters.project.length > 0 &&
          _filters.project.split(',');
      result = result.filter(c => {
        // ERs check
        const erCheck = ers
          ? c.payroll.find(pr =>
            ers.find(er => er == pr.employmentRelationship.id),
          )
          : true;

        // ERs check
        const instituteCheck = institutes
          ? c.payroll.find(pr => institutes.find(i => i == pr.institute.id))
          : true;

        // ERs check
        const projectCheck = projects
          ? c.payroll.find(pr => projects.find(p => p == pr.project.id))
          : true;

        return erCheck && instituteCheck && projectCheck;
      });
    }

    const collaboratorsList = result.map(
      c =>
        <CollaboratorExportDto>{
          id: c.id,
          name: c.name,
          socialName: c.socialName,
          jobTitle: c.jobTitle,
          cpf: c.cpf,
          rg: c.rg,
          rgEmitter: c.rgEmitter,
          pis: c.pis,
          maritalStatus: c.maritalStatus,
          nationality: c.nationality,
          birthDate: moment(c.birthDate).format('DD/MM/YYYY'),
          email: c.email,
          personalEmail: c.personalEmail,
          phone: c.phone,
          address: c.address,
          neighbourhood: c.neighbourhood,
          postalCode: c.postalCode,
          stateStr: c.state.name,
          cityStr: c.city.name,
          dependents: c.dependents ? c.dependents.length : 0,
          benefits: c.benefits
            ? c.benefits.reduce((lista, b) => {
              return `${lista}${lista && lista.length > 0 ? ', ' : ''}${b.benefitType.name
                }`;
            }, '')
            : '',
          // payRoll: ''
        },
    );

    
    // TODO: Bring this from the i18n file
    const csvHeaders = [
      'ID',
      'Nome Completo',
      'Nome Social',
      'Cargo',
      'CPF',
      'RG',
      'Emissor RG',
      'PIS',
      'Estado Civil',
      'Nacionalidade',
      'Data de Nascimento',
      'E-mail',
      'E-mail Pessoal',
      'Telefone',
      'Endereço',
      'Bairro',
      'CEP',
      'Estado',
      'Cidade',
      'Dependentes',
      'Beneficios',
    ];

    const options = {
      fieldSeparator: ';',
      quoteStrings: '"',
      decimalSeparator: ',',
      showLabels: true,
      useTextFile: false,
      useBom: true,
      // useKeysAsHeaders: true,
      headers: csvHeaders,
    };

    // TODO: update to export-to-csv v1.2.2
    // const csvExporter = new ExportToCsv(options);
    // const reportContent = csvExporter.generateCsv(collaboratorsList, true);
    const reportContent = "";

    const filename =
      moment().format('YYYYMMDDHHmmss_') +
      (await i18n.translate('collaborator.REPORTS.GENERAL.FILENAME')) +
      '.csv';

    return <CollaboratorCSVReport>{
      filename: filename,
      content: reportContent,
    };
  }

  async filteredCompact(
    stringSearch: string,
    isActive: boolean,
  ): Promise<CollaboratorDropdownDto[]> {
    const filters: FindManyOptions<Collaborator> = {
      order: {
        name: 'ASC',
      },
      where: {
        active: isActive,
      },
    };
    if (stringSearch && stringSearch.length > 0) {
      const nameFilters = stringSearch.split(' ').map(s => {
        return { name: Raw(alias => `${alias} ilike '%${s}%'`), active: true };
      });
      filters.where = nameFilters;
    }
    return (await this.collaboratorsRepository.find(filters)).map(
      p =>
        <CollaboratorDropdownDto>{
          id: p.id,
          name: p.name,
          socilName: p.socialName,
        },
    );
  }

  async findOne(collaboratorId: number): Promise<Collaborator> {
    return this.collaboratorsRepository.findOne({where: {
      id: collaboratorId
    }});
  }

  async findByName(name: string) {
    return this.collaboratorsRepository.findOne({ where: { name: name } });
  }
  async findByCpf(cpf: string): Promise<boolean> {
    const _cpf = cpf.replace(/[ .-]/g, '');
    const collab = await this.collaboratorsRepository.findOne({ where: { cpf: _cpf } });
    if (!collab) return false
    return true
  }

  async create(
    createCollaboratorDto: CreateCollaboratorDto,
    auditEntry: AudityEntryDto,
  ): Promise<CollaboratorCardDto> {
    const newCollaborator = new Collaborator();
    newCollaborator.active = true;
    newCollaborator.name = createCollaboratorDto.name;
    newCollaborator.socialName = createCollaboratorDto.socialName;
    newCollaborator.cpf = createCollaboratorDto.cpf.replace(/[ .-]/g, '');
    newCollaborator.rg = createCollaboratorDto.rg;
    newCollaborator.rgEmitter = createCollaboratorDto.rgEmitter;
    newCollaborator.identityDocumentType =
      createCollaboratorDto.identityDocumentType;
    newCollaborator.identityDocument = createCollaboratorDto.identityDocument;
    newCollaborator.pis = createCollaboratorDto.pis;
    newCollaborator.maritalStatus = createCollaboratorDto.maritalStatus;
    newCollaborator.nationality = createCollaboratorDto.nationality;
    newCollaborator.birthDate = moment(
      createCollaboratorDto.birthDate,
      'YYYY-MM-DD',
    ).toDate();
    newCollaborator.email = createCollaboratorDto.email;
    newCollaborator.personalEmail = createCollaboratorDto.personalEmail;
    newCollaborator.phone = createCollaboratorDto.phone.replace(/[ .-]/g, '');
    newCollaborator.motherName = createCollaboratorDto.motherName;
    newCollaborator.fatherName = createCollaboratorDto.fatherName;
    newCollaborator.address = createCollaboratorDto.address;
    newCollaborator.neighbourhood = createCollaboratorDto.neighbourhood;
    newCollaborator.postalCode = createCollaboratorDto.postalCode.replace(
      /[ .-]/g,
      '',
    );

    newCollaborator.emergencyContact1 = createCollaboratorDto.emergencyContact1;
    newCollaborator.emergencyParentage1 = createCollaboratorDto.emergencyParentage1;
    newCollaborator.emergencyContact2 = createCollaboratorDto.emergencyContact2;
    newCollaborator.emergencyParentage2 = createCollaboratorDto.emergencyParentage2;
    if (createCollaboratorDto.emergencyPhone1 != undefined) {
      newCollaborator.emergencyPhone1 = createCollaboratorDto.emergencyPhone1.replace(
        /[ .-]/g,
        '',
      );
    } else {
      newCollaborator.emergencyPhone1 = undefined;
    }

    if (createCollaboratorDto.emergencyContact2 != undefined) {
      newCollaborator.emergencyPhone2 = createCollaboratorDto.emergencyPhone2.replace(
        /[ .-]/g,
        '',
      );
    } else {
      newCollaborator.emergencyPhone1 = undefined;
    }

    newCollaborator.activities = createCollaboratorDto.activities;
    newCollaborator.image = createCollaboratorDto.image;
    newCollaborator.gender = createCollaboratorDto.gender;
    newCollaborator.academicDegree = createCollaboratorDto.academicDegree;
    newCollaborator.educationalInstitution =
      createCollaboratorDto.educationalInstitution;
    newCollaborator.lattes = createCollaboratorDto.lattes;

    // TODO: enforce those instead of {city|state}Str temporary options
    if (createCollaboratorDto.state) {
      newCollaborator.state = await this.locationService.findState(
        createCollaboratorDto.state,
      );
    }
    if (createCollaboratorDto.city) {
      newCollaborator.city = await this.locationService.findCity(
        createCollaboratorDto.city,
      );
    }

    newCollaborator.stateStr = createCollaboratorDto.stateStr;
    newCollaborator.cityStr = createCollaboratorDto.cityStr;

    newCollaborator.dependents = [];
    if (
      createCollaboratorDto.dependents &&
      createCollaboratorDto.dependents.length > 0
    ) {
      for (const dp of createCollaboratorDto.dependents) {
        const docs: Document[] = await this.documentsService.findByIds(
          dp.documents,
        );
        const dependent = new Dependent();
        dependent.name = dp.name;
        dependent.relationship = dp.relationship;
        dependent.birthDate = moment(dp.birthDate, 'YYYY-MM-DD').toDate();
        dependent.documents = docs;

        newCollaborator.dependents.push(dependent);
      }
    }

    newCollaborator.documents = [];
    if (
      createCollaboratorDto.documents &&
      createCollaboratorDto.documents.length > 0
    ) {
      newCollaborator.documents = await this.documentsService.findByIds(
        createCollaboratorDto.documents,
      );
    }

    // Payroll --> triple Collaborator x Project x Institute
    newCollaborator.payroll = [];
    newCollaborator.payrollHistory = [];
    if (
      createCollaboratorDto.payRoll &&
      createCollaboratorDto.payRoll.length > 0
    ) {
      for (const pay of createCollaboratorDto.payRoll) {
        const payRoll = await this.buildPayroll(pay);
        newCollaborator.payroll.push(payRoll);

        const payRollHistory = this.buildPayrollHistory(
          payRoll,
          ORIGINAL_PAYROLL_REASON,
        );
        newCollaborator.payrollHistory.push(payRollHistory);
      }
    }

    newCollaborator.jobTitle = createCollaboratorDto.jobTitle;

    // TODO: Choose the correct job title - discuss with the team
    if (!newCollaborator.jobTitle) {
      if (
        createCollaboratorDto.payRoll &&
        createCollaboratorDto.payRoll.length > 0
      ) {
        newCollaborator.jobTitle = createCollaboratorDto.payRoll[0].jobTitle;
      } else {
        newCollaborator.jobTitle = 'A definir';
      }
    }

    const cpfFound: Collaborator = await this.collaboratorsRepository.findOne({
      where: {
        cpf: newCollaborator.cpf
      }
    });

    if (cpfFound) throw new BadRequestException('This cpf is already in use');

    this.collaboratorsRepository.create(newCollaborator);

    await this.collaboratorsRepository.save(newCollaborator);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {
      documents,
      dependents,
      benefits,
      payRoll,
      ...remaining
    } = createCollaboratorDto;

    // Adding to project as member
    await this.projectService.addProjectMemberFromPayrolls(newCollaborator);

    let refreshEntityDocs = false,
      refreshEntityDepDocs = false;
    // Documents movement on Storage + database update
    for (const doc of newCollaborator.documents) {
      // TODO: Replace with something not hardcoded
      if (doc.url.includes('_CAPTIA_TEMP_COLLABORATOR_ID_')) {
        refreshEntityDocs = true;
        const newPath = doc.url.replace(
          /_CAPTIA_TEMP_COLLABORATOR_ID_/g,
          newCollaborator.id.toString(),
        );
        try {
          await this.fileManagementService.moveFileFromTempPath(
            doc.url,
            newPath,
          );
          doc.url = newPath;
        } catch (e) {
          console.error('Error while adjusting file path on S3', e);
          this.logger.error(
            'Error while adjusting file path on S3',
            `doc.url = ${doc.url}`,
            `newPath = ${newPath}`,
            e,
          );
        }
      }
    }

    for (const dep of newCollaborator.dependents) {
      for (const doc of dep.documents) {
        // TODO: Replace with something not hardcoded
        if (
          doc.url.includes('_CAPTIA_TEMP_COLLABORATOR_ID_') ||
          doc.url.includes('_CAPTIA_TEMP_DEPENDENT_ID_')
        ) {
          refreshEntityDepDocs = true;
          const newPath = doc.url
            .replace(
              /_CAPTIA_TEMP_COLLABORATOR_ID_/g,
              newCollaborator.id.toString(),
            )
            .replace(/_CAPTIA_TEMP_DEPENDENT_ID_/g, dep.id.toString());
          try {
            await this.fileManagementService.moveFileFromTempPath(
              doc.url,
              newPath,
            );
          } catch (e) {
            console.error('Error while adjusting file path on S3', e);
            this.logger.error(
              'Error while adjusting file path on S3',
              `doc.url = ${doc.url}`,
              `newPath = ${newPath}`,
              e,
            );
          }
          doc.url = newPath;
        }
      }
    }

    if (refreshEntityDocs || refreshEntityDepDocs) {
      await this.collaboratorsRepository.save(newCollaborator);
    }

    const collaboratorDocumentsDto = newCollaborator.documents.map(
      d =>
        <DocumentDto>{
          id: d.id,
          filename: d.filename,
          created: moment(d.created).format('DD/MM/YYYY [às] HH:mm'),
          url: d.url,
          icon: d.fileType.icon,
          iconHighContrast: d.fileType.iconHighContrast,
          size: filesize.filesize(d.size),
          documentType:
            d.documentType &&
            <DocumentTypeDto>{
              id: d.documentType.id,
              name: d.documentType.name,
            },
          fileType:
            d.fileType &&
            <FileTypeDto>{
              id: d.fileType.id,
              name: d.fileType.name,
            },
        },
    );

    if (auditEntry) {
      auditEntry.actionType = 'CREATE';
      auditEntry.targetEntity = this.collaboratorsRepository.metadata.targetName;
      auditEntry.targetTable = this.collaboratorsRepository.metadata.tableName;
      auditEntry.targetEntityId = newCollaborator.id;
      auditEntry.targetEntityBody = JSON.stringify(
        classToPlain(newCollaborator),
      );
      this.auditService.audit(auditEntry);
    }
    return <CollaboratorDto>{
      id: newCollaborator.id,
      documents: collaboratorDocumentsDto,
      ...remaining,
    };
  }

  // async update(updateProjectDto: UpdateProjectDto): Promise<ProjectDto> {

  //   const dbProject = await this.findOne(updateProjectDto.id);

  //   if (!dbProject) {
  //     throw new NotFoundException(
  //       await I18nContext.current().translate('collaborator.NOT_FOUND', {
  //         args: { id: updateProjectDto.id },
  //       })
  //     );
  //   }

  //   return <ProjectDto>{
  //     id: dbProject.id,
  //     projectMembers: projectMembersDto,
  //     documents: projectDocumentsDto,
  //     ...remaining
  //   };
  // }

  async update(
    updateCollaboratorDto: UpdateCollaboratorDto,
    auditEntry: AudityEntryDto,
  ): Promise<CollaboratorCardDto> {
    // const dbCollaborator = await this.collaboratorsRepository.findOne(
    //   updateCollaboratorDto.id,
    //   {
    //     relations: [
    //       'documents',
    //       'payroll',
    //       'payroll.budgetCategory',
    //       'payroll.payments',
    //       'payroll.benefits',
    //       'payroll.project',
    //       'payrollHistory',
    //       'dependents',
    //     ],
    //   },
    // );

  const _r = this.collaboratorsRepository
            .createQueryBuilder('collaborator')
            .leftJoinAndSelect('collaborator.documents', 'documents')
            .leftJoinAndSelect('collaborator.dependents', 'dependents')
            .leftJoinAndSelect('collaborator.payroll', 'payroll')
            .leftJoinAndSelect('payroll.payments', 'payments')
            .leftJoinAndSelect('payroll.benefits', 'benefits')
            .leftJoinAndSelect('payroll.project', 'project')
            .leftJoinAndSelect('collaborator.payrollHistory', 'payrollHistory')
            .where('collaborator.id = :collaboratorId', { collaboratorId: updateCollaboratorDto.id });

  const dbCollaborator = await _r.getOne();

    if (!dbCollaborator) {
      throw new NotFoundException(
        await I18nContext.current().translate('collaborator.NOT_FOUND', {
          args: { id: updateCollaboratorDto.id },
        }),
      );
    }

    dbCollaborator.active = true;
    dbCollaborator.name = updateCollaboratorDto.name;
    dbCollaborator.socialName = updateCollaboratorDto.socialName;
    dbCollaborator.cpf = updateCollaboratorDto.cpf.replace(/[ .-]/g, '');
    dbCollaborator.rg = updateCollaboratorDto.rg;
    dbCollaborator.rgEmitter = updateCollaboratorDto.rgEmitter;
    dbCollaborator.identityDocumentType =
      updateCollaboratorDto.identityDocumentType;
    dbCollaborator.identityDocument = updateCollaboratorDto.identityDocument;
    dbCollaborator.pis = updateCollaboratorDto.pis;
    dbCollaborator.maritalStatus = updateCollaboratorDto.maritalStatus;
    dbCollaborator.nationality = updateCollaboratorDto.nationality;
    dbCollaborator.birthDate = moment(
      updateCollaboratorDto.birthDate,
      'YYYY-MM-DD',
    ).toDate();
    dbCollaborator.email = updateCollaboratorDto.email;
    dbCollaborator.personalEmail = updateCollaboratorDto.personalEmail;
    dbCollaborator.phone = updateCollaboratorDto.phone.replace(/[ .-]/g, '');
    dbCollaborator.motherName = updateCollaboratorDto.motherName;
    dbCollaborator.fatherName = updateCollaboratorDto.fatherName;
    dbCollaborator.address = updateCollaboratorDto.address;
    dbCollaborator.neighbourhood = updateCollaboratorDto.neighbourhood;
    dbCollaborator.postalCode = updateCollaboratorDto.postalCode.replace(
      /[ .-]/g,
      '',
    );

    dbCollaborator.emergencyContact1 = updateCollaboratorDto.emergencyContact1
    dbCollaborator.emergencyParentage1 = updateCollaboratorDto.emergencyParentage1
    if (updateCollaboratorDto.emergencyPhone1 != null) {
      dbCollaborator.emergencyPhone1 = updateCollaboratorDto.emergencyPhone1.replace(
        /[ .-]/g,
        '',
      );
    }
    if (updateCollaboratorDto.emergencyPhone1 === '' && updateCollaboratorDto.emergencyPhone1.replace(/\s/g, "") == "") {
      dbCollaborator.emergencyPhone1 = null
    }

    dbCollaborator.emergencyContact2 = updateCollaboratorDto.emergencyContact2
    dbCollaborator.emergencyParentage2 = updateCollaboratorDto.emergencyParentage2
    if (updateCollaboratorDto.emergencyPhone2 != null) {
      dbCollaborator.emergencyPhone2 = updateCollaboratorDto.emergencyPhone2.replace(
        /[ .-]/g,
        '',
      );
    }
    if (updateCollaboratorDto.emergencyPhone2 === '' && updateCollaboratorDto.emergencyPhone2.replace(/\s/g, "") == "") {
      dbCollaborator.emergencyPhone2 = null
    }

    dbCollaborator.activities = updateCollaboratorDto.activities;
    dbCollaborator.image = updateCollaboratorDto.image;
    dbCollaborator.gender = updateCollaboratorDto.gender;
    dbCollaborator.academicDegree = updateCollaboratorDto.academicDegree;
    dbCollaborator.educationalInstitution =
      updateCollaboratorDto.educationalInstitution;
    dbCollaborator.lattes = updateCollaboratorDto.lattes;

    if (updateCollaboratorDto.state) {
      dbCollaborator.state = await this.locationService.findState(
        updateCollaboratorDto.state,
      );
    }
    if (updateCollaboratorDto.city) {
      dbCollaborator.city = await this.locationService.findCity(
        updateCollaboratorDto.city,
      );
    }

    dbCollaborator.dependents = [];
    if (
      updateCollaboratorDto.dependents &&
      updateCollaboratorDto.dependents.length > 0
    ) {
      for (const dp of updateCollaboratorDto.dependents) {
        const docs: Document[] = await this.documentsService.findByIds(
          dp.documents,
        );
        const dependent = new Dependent();
        dependent.id = dp.id;
        dependent.name = dp.name;
        dependent.relationship = dp.relationship;
        dependent.birthDate = moment(dp.birthDate, 'YYYY-MM-DD').toDate();
        dependent.documents = docs;

        dbCollaborator.dependents.push(dependent);
      }
    }

    dbCollaborator.documents = [];
    if (
      updateCollaboratorDto.documents &&
      updateCollaboratorDto.documents.length > 0
    ) {
      dbCollaborator.documents = await this.documentsService.findByIds(
        updateCollaboratorDto.documents,
      );
    }

    if (!dbCollaborator.payroll) {
      dbCollaborator.payroll = [];
    }
    if (!dbCollaborator.payrollHistory) {
      dbCollaborator.payrollHistory = [];
    }

    const _payRolls = [...dbCollaborator.payroll];
    // dbCollaborator.payroll = [];
    if (
      updateCollaboratorDto.payRoll &&
      updateCollaboratorDto.payRoll.length > 0
    ) {
      for (const payrollDto of updateCollaboratorDto.payRoll) {
        // New payroll - same creation flow
        if (!payrollDto.id) {
          const payRoll = await this.buildPayroll(payrollDto);
          dbCollaborator.payroll.push(payRoll);
          const payRollHistory = this.buildPayrollHistory(
            payRoll,
            ORIGINAL_PAYROLL_REASON,
          );
          dbCollaborator.payrollHistory.push(payRollHistory);
        } else {
          // Payroll changes validation
          const originalPayroll = _payRolls.find(pr => pr.id == payrollDto.id);
          const changesList = await this.applyPayrollChanges(
            originalPayroll,
            payrollDto,
          );

          // Changes on job title and workload alone won't create a new payroll version
          originalPayroll.jobTitle = payrollDto.jobTitle;
          originalPayroll.workload = payrollDto.workload && +payrollDto.workload;

          if (changesList && changesList.length > 0) {
            originalPayroll.version += 1;
            const payRollHistory = this.buildPayrollHistory(
              originalPayroll,
              changesList,
            );
            dbCollaborator.payrollHistory.push(payRollHistory);
          }
        }
      }
    }

    // Full payroll removal
    const removedPayrolls = _payRolls.filter(
      pr =>
        pr.id &&
        !updateCollaboratorDto.payRoll?.find(_pr => _pr.id && _pr.id == pr.id),
    );
    if (removedPayrolls && removedPayrolls.length > 0) {
      removedPayrolls.map(async pr => {
        await this.payrollService.deletePayrolls(pr);
      })
    }

    dbCollaborator.jobTitle = updateCollaboratorDto.jobTitle;

    if (!dbCollaborator.jobTitle) {
      if (
        updateCollaboratorDto.payRoll &&
        updateCollaboratorDto.payRoll.length > 0
      ) {
        dbCollaborator.jobTitle = updateCollaboratorDto.payRoll[0].jobTitle;
      } else {
        dbCollaborator.jobTitle = 'A definir';
      }
    }

    await this.collaboratorsRepository.save(dbCollaborator);

    for (const _payroll of dbCollaborator.payroll) {
      if(_payroll.payments && _payroll.payments.some(p => p.payroll == undefined)){
        this.payrollService.forcePayrollReferenceOnPayments(_payroll);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {
      documents,
      dependents,
      benefits,
      payRoll,
      ...remaining
    } = updateCollaboratorDto;

    let refreshEntityDocs = false,
      refreshEntityDepDocs = false;
    // Documents movement on Storage + database update
    for (const doc of dbCollaborator.documents) {
      // TODO: Replace with something not hardcoded
      if (doc.url.includes('_CAPTIA_TEMP_COLLABORATOR_ID_')) {
        refreshEntityDocs = true;
        const newPath = doc.url.replace(
          /_CAPTIA_TEMP_COLLABORATOR_ID_/g,
          dbCollaborator.id.toString(),
        );
        await this.fileManagementService.moveFileFromTempPath(doc.url, newPath);
        doc.url = newPath;
      }
    }

    for (const dep of dbCollaborator.dependents) {
      for (const doc of dep.documents) {
        // TODO: Replace with something not hardcoded
        if (
          doc.url.includes('_CAPTIA_TEMP_COLLABORATOR_ID_') ||
          doc.url.includes('_CAPTIA_TEMP_DEPENDENT_ID_')
        ) {
          refreshEntityDepDocs = true;
          const newPath = doc.url
            .replace(
              /_CAPTIA_TEMP_COLLABORATOR_ID_/g,
              dbCollaborator.id.toString(),
            )
            .replace(/_CAPTIA_TEMP_DEPENDENT_ID_/g, dep.id.toString());
          await this.fileManagementService.moveFileFromTempPath(
            doc.url,
            newPath,
          );
          doc.url = newPath;
        }
      }
    }

    if (refreshEntityDocs || refreshEntityDepDocs) {
      await this.collaboratorsRepository.save(dbCollaborator);
    }

    // Adding to project as member
    await this.projectService.addProjectMemberFromPayrolls(dbCollaborator);

    const collaboratorDocumentsDto = dbCollaborator.documents.map(
      d =>
        <DocumentDto>{
          id: d.id,
          filename: d.filename,
          created: moment(d.created).format('DD/MM/YYYY [às] HH:mm'),
          url: d.url,
          icon: d.fileType.icon,
          iconHighContrast: d.fileType.iconHighContrast,
          size: filesize.filesize(d.size),
          documentType:
            d.documentType &&
            <DocumentTypeDto>{
              id: d.documentType.id,
              name: d.documentType.name,
            },
          fileType:
            d.fileType &&
            <FileTypeDto>{
              id: d.fileType.id,
              name: d.fileType.name,
            },
        },
    );

    if (auditEntry) {
      auditEntry.actionType = 'UPDATE';
      auditEntry.targetEntity = this.collaboratorsRepository.metadata.targetName;
      auditEntry.targetTable = this.collaboratorsRepository.metadata.tableName;
      auditEntry.targetEntityId = dbCollaborator.id;
      auditEntry.targetEntityBody = JSON.stringify(
        classToPlain(dbCollaborator),
      );
      this.auditService.audit(auditEntry);
    }
    return <CollaboratorDto>{
      id: dbCollaborator.id,
      documents: collaboratorDocumentsDto,
      ...remaining,
    };
  }

  async getById(
    collaboratorId: number,
    i18n: I18nContext,
    _auditEntry: AudityEntryDto,
  ): Promise<CollaboratorDto> {
    // const dbCollaborator = await this.collaboratorsRepository.findOne(
    //   collaboratorId,
    //   {
    //     relations: [
    //       'state',
    //       'city',
    //       'documents',
    //       'payroll',
    //       'payroll.employmentRelationship',
    //       'payroll.institute',
    //       'payroll.project',
    //       'payroll.budgetCategory',
    //       'payroll.benefits',
    //       'benefits',
    //       'dependents',
    //       'dependents.documents',
    //     ],
    //   },
    // );

    
    const _r = this.collaboratorsRepository
      .createQueryBuilder('collaborator')
      .leftJoinAndSelect('collaborator.state', 'state')
      .leftJoinAndSelect('collaborator.city', 'city')
      // .leftJoinAndSelect('collaborator.benefits', 'cbenefits')
      .leftJoinAndSelect('collaborator.documents', 'documents')
      .leftJoinAndSelect('documents.documentType', 'documentType')
      .leftJoinAndSelect('documentType.documentCategory', 'documentCategory')
      .leftJoinAndSelect('documents.fileType', 'fileType')
      .leftJoinAndSelect('collaborator.dependents', 'dependents')
      .leftJoinAndSelect('dependents.documents', 'ddocuments')
      .leftJoinAndSelect('ddocuments.documentType', 'ddocumentType')
      .leftJoinAndSelect('ddocumentType.documentCategory', 'ddocumentCategory')
      .leftJoinAndSelect('ddocuments.fileType', 'dfileType')
      .leftJoinAndSelect('collaborator.payroll', 'payroll')
      .leftJoinAndSelect('payroll.payments', 'payments')
      .leftJoinAndSelect('payroll.employmentRelationship', 'employmentRelationship')      
      .leftJoinAndSelect('payroll.benefits', 'benefits')
      .leftJoinAndSelect('benefits.benefitType', 'benefitType')      
      .leftJoinAndSelect('payroll.project', 'project')
      .leftJoinAndSelect('payroll.institute', 'institute')      
      .leftJoinAndSelect('payroll.budgetCategory', 'budgetCategory')
      .leftJoinAndSelect('collaborator.payrollHistory', 'payrollHistory')
      .where('collaborator.id = :collaboratorId', { collaboratorId });

    const dbCollaborator = await _r.getOne();

    if (!dbCollaborator) {
      throw new NotFoundException(
        await i18n.translate('collaborator.NOT_FOUND', {
          args: { id: collaboratorId },
        }),
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {
      documents,
      dependents,
      benefits,
      payroll,
      ...remaining
    } = dbCollaborator;

    const collaboratorDocumentsDto =
      dbCollaborator.documents &&
      dbCollaborator.documents.map(
        d =>
          <DocumentDto>{
            id: d.id,
            filename: d.filename,
            url: d.url,
            icon: d.fileType.icon,
            iconHighContrast: d.fileType.iconHighContrast,
            size: filesize.filesize(d.size),
            created: moment(d.created).format('DD/MM/YYYY [às] HH:mm'),
            documentType:
              d.documentType &&
              <DocumentTypeDto>{
                id: d.documentType.id,
                name: d.documentType.name,
                category: <DocumentCategoryDto>{
                  id: d.documentType.documentCategory.id,
                  name: d.documentType.documentCategory.name,
                },
              },
            fileType:
              d.fileType &&
              <FileTypeDto>{
                id: d.fileType.id,
                name: d.fileType.name,
              },
          },
      );

    const payrollsDto =
      dbCollaborator.payroll &&
      dbCollaborator.payroll.map(
        pr =>
          <PayRollDto>{
            id: pr.id,
            active: pr.active,
            workload: pr.workload,
            jobTitle: pr.jobTitle,
            admission: moment(pr.admission).format('DD/MM/YYYY'),
            dismissal: pr.dismissal
              ? moment(pr.dismissal).format('DD/MM/YYYY')
              : '',
            salary: pr.salary,
            institute: <InstituteDto>{
              id: pr.institute.id,
              name: pr.institute.name,
              abbreviation: pr.institute.abbreviation,
            },
            project:
              pr.project &&
              <ProjectDto>{
                id: pr.project.id,
                name: pr.project.name,
              },
            employmentRelationship:
              pr.employmentRelationship &&
              <EmploymentRelationshipDto>{
                id: pr.employmentRelationship.id,
                code: pr.employmentRelationship.code,
                name: pr.employmentRelationship.name,
              },
            budgetCategory:
              pr.budgetCategory &&
              <BudgetCategoryDto>{
                id: pr.budgetCategory.id,
                code: pr.budgetCategory.code,
                name: pr.budgetCategory.name,
              },
            benefits:
              pr.benefits &&
              pr.benefits.map(
                prb =>
                  <BenefitDto>{
                    id: prb.id,
                    benefitType: <BenefitTypeDto>{
                      id: prb.benefitType.id,
                      code: prb.benefitType.code,
                      name: prb.benefitType.name,
                      custom: prb.benefitType.custom,
                    },
                    amountType: prb.amountType,
                    amountValue: prb.amountValue,
                    deductionType: prb.deductionType,
                    deductionValue: prb.deductionValue,
                    description: prb.description,
                  },
              ),
          },
      );

    const benefitsDto =
      dbCollaborator.benefits &&
      dbCollaborator.benefits.map(
        b =>
          <BenefitDto>{
            id: b.id,
            benefitType: <BenefitTypeDto>{
              id: b.benefitType.id,
              code: b.benefitType.code,
              name: b.benefitType.name,
              custom: b.benefitType.custom,
            },
            amountType: b.amountType,
            amountValue: b.amountValue,
            deductionType: b.deductionType,
            deductionValue: b.deductionValue,
          },
      );

    const dependentsDto =
      dbCollaborator.dependents &&
      dbCollaborator.dependents.map(
        d =>
          <DependentDto>{
            id: d.id,
            name: d.name,
            birthDate: moment(d.birthDate).format('DD/MM/YYYY'),
            relationship: d.relationship,
            documents:
              d.documents &&
              d.documents.map(
                dd =>
                  <DocumentDto>{
                    id: dd.id,
                    filename: dd.filename,
                    size: filesize.filesize(dd.size),
                    created: moment(dd.created).format('DD/MM/YYYY [às] HH:mm'),
                    url: dd.url,
                    documentType:
                      dd.documentType &&
                      <DocumentTypeDto>{
                        id: dd.documentType.id,
                        name: dd.documentType.name,
                      },
                    fileType:
                      dd.fileType &&
                      <FileTypeDto>{
                        id: dd.fileType.id,
                        name: dd.fileType.name,
                      },
                  },
              ),
          },
      );

    return <CollaboratorDto>{
      id: dbCollaborator.id,
      active: dbCollaborator.active,
      name: dbCollaborator.name,
      socialName: dbCollaborator.socialName,
      cpf: dbCollaborator.cpf,
      rg: dbCollaborator.rg,
      birthDate: moment(dbCollaborator.birthDate).format('DD/MM/YYYY'),
      city: dbCollaborator.city.id,
      state: dbCollaborator.state.id,
      rgEmitter: dbCollaborator.rgEmitter,
      identityDocumentType: dbCollaborator.identityDocumentType,
      identityDocument: dbCollaborator.identityDocument,
      pis: dbCollaborator.pis,
      maritalStatus: dbCollaborator.maritalStatus,
      nationality: dbCollaborator.nationality,
      email: dbCollaborator.email,
      personalEmail: dbCollaborator.personalEmail,
      phone: dbCollaborator.phone,
      motherName: dbCollaborator.motherName,
      fatherName: dbCollaborator.fatherName,
      address: dbCollaborator.address,
      neighbourhood: dbCollaborator.neighbourhood,
      postalCode: dbCollaborator.postalCode,
      emergencyContact1: dbCollaborator.emergencyContact1,
      emergencyParentage1: dbCollaborator.emergencyParentage1,
      emergencyPhone1: dbCollaborator.emergencyPhone1,
      emergencyContact2: dbCollaborator.emergencyContact2,
      emergencyParentage2: dbCollaborator.emergencyParentage2,
      emergencyPhone2: dbCollaborator.emergencyPhone2,
      activities: dbCollaborator.activities,
      image: dbCollaborator.image,
      gender: dbCollaborator.gender,
      academicDegree: dbCollaborator.academicDegree,
      educationalInstitution: dbCollaborator.educationalInstitution,
      lattes: dbCollaborator.lattes,
      documents: collaboratorDocumentsDto ?? [],
      payRoll: payrollsDto ?? [],
      benefits: benefitsDto ?? [],
      dependents: dependentsDto ?? [],
    };
  }

  async delete(
    collaboratorId: number,
    i18n: I18nContext,
    auditEntry: AudityEntryDto,
  ): Promise<boolean> {
    let dbColaborator = await this.findOne(collaboratorId);

    if (!dbColaborator) {
      throw new NotFoundException(
        await i18n.translate('collaborator.NOT_FOUND', {
          args: { id: collaboratorId },
        }),
      );
    }

    if (await this.projectMemberService.changeMemberStatus(collaboratorId, 'DELETE') === true) {
      dbColaborator.active = false;
      dbColaborator = await this.collaboratorsRepository.save(dbColaborator);

      if (auditEntry) {
        auditEntry.actionType = 'DELETE';
        auditEntry.targetEntity = this.collaboratorsRepository.metadata.targetName;
        auditEntry.targetTable = this.collaboratorsRepository.metadata.tableName;
        auditEntry.targetEntityId = dbColaborator.id;
        auditEntry.targetEntityBody = '';
        this.auditService.audit(auditEntry);
      }

      return dbColaborator.active === false;
    }
  }

  async activate(
    collaboratorId: number,
    i18n: I18nContext,
    auditEntry: AudityEntryDto,
  ): Promise<boolean> {
    let dbColaborator = await this.findOne(collaboratorId);

    if (!dbColaborator) {
      throw new NotFoundException(
        await i18n.translate('collaborator.NOT_FOUND', {
          args: { id: collaboratorId },
        }),
      );
    }

    if (await this.projectMemberService.changeMemberStatus(collaboratorId, 'ACTIVATE') === false) {
      dbColaborator.active = true;
      dbColaborator = await this.collaboratorsRepository.save(dbColaborator);

      if (auditEntry) {
        auditEntry.actionType = 'ACTIVATE';
        auditEntry.targetEntity = this.collaboratorsRepository.metadata.targetName;
        auditEntry.targetTable = this.collaboratorsRepository.metadata.tableName;
        auditEntry.targetEntityId = dbColaborator.id;
        auditEntry.targetEntityBody = '';
        this.auditService.audit(auditEntry);
      }

      return dbColaborator.active === true;
    }
  }

  async getMonthReportsOverview(
    idCollaborator: number,
  ): Promise<MonthReportItemDto[]> {
    const payrolls: PayRollDto[] = await this.payrollService.getProjectsByPayroll(
      idCollaborator,
      [2, 3, 4],
    );
    const current = moment();

    const dbReports = await this.collaboratorMonthlyReportRepository.find({
      where: {
        collaborator: { id: idCollaborator },
        year: current.year(),
        month: current.month() + 1,
      },
      relations: ['project'],
    });

    return payrolls.map(pr => {
      const report = dbReports.find(r => r.project.id == pr.project.id);
      return <MonthReportItemDto>{
        payroll: pr,
        activities: report && report.activities,
        sent: !!report,
        lastUpdate:
          report &&
          report.lastUpdate &&
          moment(report.lastUpdate).format('DD/MM/YYYY'),
      };
    });
  }

  async saveMonthlyReport(
    reportDto: CollaboratorMonthlyReportDto,
    auditEntry: AudityEntryDto,
  ) {
    let dbReport = await this.collaboratorMonthlyReportRepository.findOne({
      where: {
        collaborator: { id: reportDto.idCollaborator },
        project: { id: reportDto.idProject },
        year: reportDto.year,
        month: reportDto.month,
      },
    });

    const updateReport = dbReport && dbReport.id && dbReport.id > 0;

    if (!dbReport) {
      dbReport = new CollaboratorMonthlyReport();

      dbReport.collaborator = new Collaborator();
      dbReport.collaborator.id = reportDto.idCollaborator;

      dbReport.project = new Project();
      dbReport.project.id = reportDto.idProject;

      dbReport.year = reportDto.year;
      dbReport.month = reportDto.month;
    } else {
      dbReport.version = dbReport.version + 1;
    }

    dbReport.activities = reportDto.activities;
    dbReport.url = reportDto.url;
    dbReport.lastUpdate = new Date();
    dbReport = await this.collaboratorMonthlyReportRepository.save(dbReport);

    if (auditEntry) {
      auditEntry.actionType = updateReport ? 'UPDATE' : 'CREATE';
      auditEntry.targetEntity = this.collaboratorMonthlyReportRepository.metadata.targetName;
      auditEntry.targetTable = this.collaboratorMonthlyReportRepository.metadata.tableName;
      auditEntry.targetEntityId = dbReport.id;
      auditEntry.targetEntityBody = JSON.stringify(classToPlain(dbReport));
      this.auditService.audit(auditEntry);
    }

    return;
  }

  async buildPayroll(pay: CreatePayRollDto): Promise<PayRoll> {
    try {
      const payroll = new PayRoll();

      const institute = await this.instituteService.findOne(pay.institute);
      payroll.institute = institute;

      payroll.project = await this.projectService.findOne(pay.project);

      payroll.budgetCategory = await this.budgetCategoryService.findById(
        pay.budgetCategory,
      );

      const er = await this.erService.findOne(pay.employmentRelationship);
      payroll.employmentRelationship = er;

      payroll.jobTitle = pay.jobTitle;
      payroll.salary = pay.salary;
      payroll.workload = pay.workload;

      if (pay.admission) {
        payroll.admission = moment(pay.admission, 'YYYY-MM-DD').toDate();
      }

      if (pay.dismissal) {
        payroll.dismissal = moment(pay.dismissal, 'YYYY-MM-DD').toDate();
      } else {
        payroll.dismissal = payroll.project.end;
      }

      const benefitTypes = await this.benefitService.allTypes();

      payroll.benefits = [];
      if (pay.benefits && pay.benefits.length > 0) {
        for (const b of pay.benefits) {
          const benefit = new Benefit();

          benefit.benefitType = benefitTypes.find(
            bt => bt.id == b.benefitType.id,
          );

          benefit.institute = payroll.institute;
          benefit.project = payroll.project;

          if (b.amountValue && b.amountType) {
            benefit.amountValue = b.amountValue;
            benefit.amountType = b.amountType;
          }

          if (b.deductionValue && b.deductionType) {
            benefit.deductionValue = b.deductionValue;
            benefit.deductionType = b.deductionType;
          }

          payroll.benefits.push(benefit);
        }
      }

      // Payments calculation
      if (payroll.admission && payroll.dismissal) {
        await this.generatePayments(payroll);
      }

      payroll.version = 1;

      return payroll;
    } catch (e) {
      console.error(e);
      this.logger.error('Error while building Payroll', e);
    }

    return null;
  }

  buildPayrollHistory(payRoll: PayRoll, reason: string): PayRollHistory {
    const prHistory = new PayRollHistory();
    prHistory.institute = payRoll.institute;
    prHistory.project = payRoll.project;
    prHistory.budgetCategory = payRoll.budgetCategory;
    prHistory.employmentRelationship = payRoll.employmentRelationship;

    prHistory.jobTitle = payRoll.jobTitle;
    prHistory.salary = payRoll.salary;
    prHistory.workload = payRoll.workload;
    prHistory.admission = payRoll.admission;
    prHistory.dismissal = payRoll.dismissal;
    prHistory.version = payRoll.version;

    prHistory.benefitsList = payRoll.benefits
      ? payRoll.benefits.map(b => b.toString()).join(' ,')
      : '';

    prHistory.reason = reason;

    return prHistory;
  }

  async applyPayrollChanges(
    originalPayRoll: PayRoll,
    payrollDto: CreatePayRollDto,
  ): Promise<string> {
    // Payroll changes workflow
    // --------------------------
    // 1. Generate changes list for payroll history registry
    // 2. If there is change, delete outdated payments
    // 3. If there is change, generate new payments

    const changesList = [];

    try {
      const referencePeriod = {
        start: moment().startOf('month'),
        end: moment(payrollDto.dismissal, 'YYYY-MM-DD'),
        projectEnd: moment(originalPayRoll.project.end, 'YYYY-MM-DD'),
        months: [],
      };

      // 1. Build list of changes

      // Dismissal change : defined -> changed
      if (
        payrollDto.dismissal &&
        moment(payrollDto.dismissal, 'YYYY-MM-DD').diff(originalPayRoll.dismissal) != 0
      ) {
        if (referencePeriod.end.isAfter(referencePeriod.projectEnd)) {
          changesList.push(
            `Data de desligamento alterada: ${referencePeriod.projectEnd.format(
              'DD/MM/YYYY',
            )} (Limite do projeto)`,
          );
          referencePeriod.end = referencePeriod.projectEnd;
        } else {
          changesList.push(
            `Data de desligamento alterada: ${referencePeriod.end.format(
              'DD/MM/YYYY',
            )}`,
          );
        }
        originalPayRoll.dismissal = referencePeriod.end.toDate();
      }

      // Salary change
      if (originalPayRoll.salary != +payrollDto.salary) {
        changesList.push(
          `${originalPayRoll.salary < +payrollDto.salary ? 'Aumento' : 'Redução'
          } de salário`,
        );
        originalPayRoll.salary = +payrollDto.salary;
      }

      // New and edited benefits check
      const benefitTypes = await this.benefitService.allTypes();
      if (!originalPayRoll.benefits) {
        originalPayRoll.benefits = [];
      }
      for (const b of payrollDto.benefits) {
        const originalBenefit = originalPayRoll.benefits.find(
          opb => opb.id && (opb.id == b.id),
        );
        if (!originalBenefit) {
          // New benefit
          const benefitDescription = this.benefitSummary(b);
          changesList.push(`Novo benefício - ${benefitDescription}`);
          const benefit = new Benefit();
          benefit.benefitType = benefitTypes.find(
            bt => bt.id == b.benefitType.id,
          );
          benefit.institute = new Institute();
          benefit.institute.id = +payrollDto.institute;
          benefit.project = new Project();
          benefit.project.id = +payrollDto.project;
          if (b.amountValue && b.amountType) {
            benefit.amountValue = b.amountValue;
            benefit.amountType = b.amountType;
          }
          if (b.deductionValue && b.deductionType) {
            benefit.deductionValue = b.deductionValue;
            benefit.deductionType = b.deductionType;
          }
          originalPayRoll.benefits.push(benefit);
        }
        // Change on existing benefit
        else if (
          b.amountType != originalBenefit.amountType ||
          b.amountValue != originalBenefit.amountValue ||
          b.deductionType != originalBenefit.deductionType ||
          b.deductionValue != originalBenefit.deductionValue
        ) {
          changesList.push(`Benefício ajustado - ${this.benefitSummary(b)})`);
          originalBenefit.amountType = b.amountType;
          originalBenefit.amountValue = b.amountValue;
          originalBenefit.deductionType = b.deductionType;
          originalBenefit.deductionValue = b.deductionValue;
        }
      }

      // Benefits to be deleted
      const removedBenefits = originalPayRoll.benefits.filter(
        opb => opb.id && !payrollDto.benefits.find(b => b.id && b.id == opb.id),
      );
      if (removedBenefits && removedBenefits.length > 0) {
        originalPayRoll.benefits = originalPayRoll.benefits.filter(
          b => !removedBenefits.includes(b),
        );
        changesList.push(
          `Benefícios removidos: ${removedBenefits
            .map(b => b.benefitType.name)
            .join(', ')}`,
        );
      }

      if (changesList.length > 0) {

        // 2. Deleting payments and benefits; removing either links from payroll (filter array)
        const paymentsToDiscard = originalPayRoll.payments.filter(
          p => moment(`${+p.year}-${(+p.month + 1)}-01`, 'YYYY-MM-DD').isSameOrAfter(referencePeriod.start)
        );

        if (paymentsToDiscard && paymentsToDiscard.length > 0) {
          await this.payrollService.deletePayments(
            paymentsToDiscard.map(p => +p.id),
          );
          originalPayRoll.payments = originalPayRoll.payments.filter(
            p => !paymentsToDiscard.includes(p),
          );
        }

        if (removedBenefits && removedBenefits.length > 0) {
          await this.benefitService.deleteBenefits(
            removedBenefits.map(b => b.id),
          );
        }

        // 3. Generate new payments ONLY FOR THE SPECIFIED PERIOD
        await this.generatePayments(
          originalPayRoll,
          referencePeriod.start.isSameOrAfter(originalPayRoll.admission) ? referencePeriod.start.toDate() : originalPayRoll.admission,
          referencePeriod.end.toDate(),
        );
      }
    } catch (e) {
      this.logger.error(
        'Error while applying changes to an existing Payroll',
        e,
      );
    }

    return changesList.join('|');
  }

  async generatePayments(
    payroll: PayRoll,
    _customStart?: Date,
    _customEnd?: Date,
  ): Promise<Payment[]> {
    const admission = moment(_customStart ?? payroll.admission);
    const dismissal = moment(_customEnd ?? payroll.dismissal);
    const er = payroll.employmentRelationship;
    const institute = payroll.institute;

    // const rrNumberOfMonths = 12;

    if (!admission || !dismissal || !er || !institute) {
      this.logger.info(
        `Payments not generated for ${payroll.collaborator.name
        } due to missing information on period (${admission?.toDate()}, ${dismissal?.toDate()}), institue (${institute?.id
        }) or employment relationship (${er?.id}).`,
      );
      return [];
    }

    // Avoids discarding existing payments
    if (!payroll.payments || payroll.payments.length == 0) {
      payroll.payments = [];
    }

    const _monthDuration = await this.utilService.findSettingsByKey(
      paymentKeys[paymentKeys.PAYROLL_DEFAULT_MONTH_DURATION_IN_DAYS],
    );
    const defaultMonthDuration = this.utilService.roundFromString(
      _monthDuration,
    );

    const _yearDuration = await this.utilService.findSettingsByKey(
      paymentKeys[paymentKeys.PAYROLL_DEFAULT_YEAR_DURATION_IN_MONTHS],
    );
    const defaultYearDuration = this.utilService.roundFromString(_yearDuration);
    const numberOfMonths = dismissal
      ? dismissal.diff(admission, 'month') + 1
      : defaultYearDuration;

    const futureBonusDepositsFASTEF = {
      remaining: 0,
      current: 0,
      value: 0,
    };

    // Generating payments through contract months
    const currentMonth = admission.clone();
    for (let idxMonth = 0; idxMonth < numberOfMonths; idxMonth++) {
      // Base parameters
      let _monthPaymentValue = 0;
      const _paymentComponents: PaymentComponent[] = [];

      try {
        const businessDays = currentMonth.monthBusinessDays().length;
        const holidays = await this.notedDateService.holidaysInRange(
          currentMonth
            .clone()
            .startOf('month')
            .toDate(),
          currentMonth
            .clone()
            .endOf('month')
            .toDate(),
        );

        let daysWorked = defaultMonthDuration;
        let msgDaysWorked = '';
        if (
          currentMonth.isSame(admission, 'year') &&
          currentMonth.isSame(admission, 'month') &&
          admission.date() > 1
        ) {
          // Calcuates "worked" days if admission is on current month; else default is 30 days
          // NOTE: holidays are not considered in this calculation
          const daysWorkedInMonth = currentMonth
            .clone()
            .endOf('month')
            // .businessDiff(admission);
            .diff(admission, 'days');

          if (daysWorkedInMonth != defaultMonthDuration) {
            daysWorked = daysWorkedInMonth;
            msgDaysWorked = ` (${daysWorked} dias trabalhados)`;
          }
        } else if (
          currentMonth.isSame(dismissal, 'year') &&
          currentMonth.isSame(dismissal, 'month') &&
          dismissal.date() <
          dismissal
            .clone()
            .endOf('month')
            .date()
        ) {
          // Calcuates "worked" days if dismissal is on current month; else default is 30 days
          // NOTE: holidays are not considered in this calculation
          const _daysWorkedInMonth =
            dismissal.diff(
              currentMonth.clone().startOf('month'),
              // .businessDiff(admission);
              'days',
            ) + 1;
          const daysWorkedInMonth =
            _daysWorkedInMonth > defaultMonthDuration
              ? defaultMonthDuration
              : _daysWorkedInMonth;

          if (daysWorkedInMonth != businessDays) {
            daysWorked = daysWorkedInMonth;
            msgDaysWorked = ` (${daysWorked} dias trabalhados)`;
          }
        }

        switch (er.code) {
          case EmploymentRelationshipEnum.CLT: {
            const computedSalary = this.utilService.round(
              (payroll.salary / defaultMonthDuration) * daysWorked,
            );

            // Benefits Components
            let discountsFromBenefits = 0;
            for (const b of payroll.benefits) {
              switch (b.benefitType.code) {
                case BenefitsEnum.VT: {
                  const transportChargeMax = this.utilService.roundFromString(
                    await this.utilService.findSettingsByKey(
                      paymentKeys[paymentKeys.CHARGE_TRANSPORT_LIMIT_VALUE],
                    ),
                  );

                  const transportChargePercentage = this.utilService.roundFromString(
                    await this.utilService.findSettingsByKey(
                      paymentKeys[
                      paymentKeys.CHARGE_TRANSPORT_LIMIT_PERCENTAGE
                      ],
                    ),
                  );
                  const transportQuotaOverSalary =
                    (computedSalary * transportChargePercentage) / 100;

                  const transportTicketValue = this.utilService.roundFromString(
                    await this.utilService.findSettingsByKey(
                      paymentKeys[paymentKeys.BENEFIT_TRANSPORT_TICKET_VALUE],
                    ),
                  );
                  const transportPaidValue =
                    transportTicketValue * (businessDays - holidays.length);

                  const costs = [
                    {
                      label: `Desconto do valor limite: R$ ${transportChargeMax}`,
                      value: transportChargeMax,
                    },
                    {
                      label: `Desconto do valor da recarga: R$ ${transportPaidValue}`,
                      value: transportPaidValue,
                    },
                    {
                      label: `Desconto da cota do salário (${transportChargePercentage}% de R$ ${computedSalary}): R$ ${transportChargeMax}`,
                      value: transportQuotaOverSalary,
                    },
                  ];
                  costs.sort(function (a, b) {
                    return a.value - b.value;
                  });

                  const vtBenefit = new PaymentComponent();
                  vtBenefit.type = PaymentComponentEnum.BENEFIT;
                  vtBenefit.description = `Vale Transporte CLT${msgDaysWorked}`;
                  vtBenefit.value = +transportPaidValue;
                  vtBenefit.leadCompensation =
                    transportPaidValue - costs[0].value;
                  vtBenefit.notes = costs[0].label;
                  vtBenefit.benefit = b;

                  _paymentComponents.push(vtBenefit);

                  const noteVtComponent = new PaymentComponent();
                  noteVtComponent.type = PaymentComponentEnum.ANNOTATION;
                  noteVtComponent.description = `Vale Transporte`;
                  noteVtComponent.value = vtBenefit.value;

                  _paymentComponents.push(noteVtComponent);

                  discountsFromBenefits += costs[0].value;
                  const vtDiscount = new PaymentComponent();
                  vtDiscount.type = PaymentComponentEnum.DISCOUNT;
                  vtDiscount.description = `Desconto Vale Transporte CLT${msgDaysWorked}`;
                  vtDiscount.value = costs[0].value;
                  vtDiscount.benefit = b;

                  _paymentComponents.push(vtDiscount);

                  break;
                }
                case BenefitsEnum.VA: {
                  const mealplanValue = b.amountValue;
                  const computedMealplanValue =
                    (mealplanValue / defaultMonthDuration) *
                    (daysWorked != defaultMonthDuration
                      ? daysWorked
                      : defaultMonthDuration);

                  const vaBenefit = new PaymentComponent();
                  vaBenefit.type = PaymentComponentEnum.BENEFIT;
                  vaBenefit.description = `Vale Alimentação CLT${msgDaysWorked}`;
                  vaBenefit.value = +computedMealplanValue;
                  vaBenefit.benefit = b;

                  _paymentComponents.push(vaBenefit);

                  const noteVaComponent = new PaymentComponent();
                  noteVaComponent.type = PaymentComponentEnum.ANNOTATION;
                  noteVaComponent.description = `Vale Alimentação`;
                  noteVaComponent.value = vaBenefit.value;

                  _paymentComponents.push(noteVaComponent);

                  const mealplanDiscount = b.deductionValue;
                  discountsFromBenefits += mealplanDiscount;

                  const vaDiscount = new PaymentComponent();
                  vaDiscount.type = PaymentComponentEnum.DISCOUNT;
                  vaDiscount.description = `Desconto Vale Alimentação CLT${msgDaysWorked}`;
                  vaDiscount.value = mealplanDiscount;
                  vaDiscount.benefit = b;

                  _paymentComponents.push(vaDiscount);

                  break;
                }
                case BenefitsEnum.VC: {

                  const vcBenefit = new PaymentComponent();
                  vcBenefit.type = PaymentComponentEnum.BENEFIT;
                  vcBenefit.description = `Vale Combustível CLT${msgDaysWorked}`;
                  if (b.amountType === 'R$') {
                    vcBenefit.value = +b.amountValue;
                  } else {
                    vcBenefit.value =
                      (this.utilService.round(b.amountValue) / 100) *
                      computedSalary;
                  }
                  vcBenefit.benefit = b;
                  _paymentComponents.push(vcBenefit);

                  const noteVCComponent = new PaymentComponent();
                  noteVCComponent.type = PaymentComponentEnum.ANNOTATION;
                  noteVCComponent.description = `Vale Combustível`;
                  noteVCComponent.value = vcBenefit.value;

                  _paymentComponents.push(noteVCComponent);

                  if (+b.deductionValue > 0) {
                    let gasPlanDiscount = 0;
                    if (b.deductionType === 'R$') {
                      gasPlanDiscount = +b.deductionValue;
                    } else {
                      gasPlanDiscount =
                        (this.utilService.round(b.deductionValue) / 100) *
                        computedSalary;
                    }

                    discountsFromBenefits += gasPlanDiscount;

                    const vcDiscount = new PaymentComponent();
                    vcDiscount.type = PaymentComponentEnum.DISCOUNT;
                    vcDiscount.description = `Desconto Vale Combustível CLT${msgDaysWorked}`;
                    vcDiscount.value = gasPlanDiscount;
                    vcDiscount.benefit = b;

                    _paymentComponents.push(vcDiscount);

                  }

                  break;
                }
                case BenefitsEnum.VCR: {

                  const vcrBenefit = new PaymentComponent();
                  vcrBenefit.type = PaymentComponentEnum.BENEFIT;
                  vcrBenefit.description = `Vale Creche CLT${msgDaysWorked}`;
                  if (b.amountType === 'R$') {
                    vcrBenefit.value = +b.amountValue;
                  } else {
                    vcrBenefit.value =
                      (this.utilService.round(b.amountValue) / 100) *
                      computedSalary;
                  }
                  vcrBenefit.benefit = b;
                  _paymentComponents.push(vcrBenefit);

                  const noteVCrComponent = new PaymentComponent();
                  noteVCrComponent.type = PaymentComponentEnum.ANNOTATION;
                  noteVCrComponent.description = `Vale Creche`;
                  noteVCrComponent.value = vcrBenefit.value;

                  _paymentComponents.push(noteVCrComponent);

                  if (+b.deductionValue > 0) {
                    let kindergartenDiscount = 0;
                    if (b.deductionType === 'R$') {
                      kindergartenDiscount = +b.deductionValue;
                    } else {
                      kindergartenDiscount =
                        (this.utilService.round(b.deductionValue) / 100) *
                        computedSalary;
                    }

                    discountsFromBenefits += kindergartenDiscount;

                    const vcrDiscount = new PaymentComponent();
                    vcrDiscount.type = PaymentComponentEnum.DISCOUNT;
                    vcrDiscount.description = `Desconto Vale Creche CLT${msgDaysWorked}`;
                    vcrDiscount.value = kindergartenDiscount;
                    vcrDiscount.benefit = b;

                    _paymentComponents.push(vcrDiscount);
                  }


                  break;
                }
                case BenefitsEnum.PS: {
                  const psBenefit = new PaymentComponent();
                  psBenefit.type = PaymentComponentEnum.BENEFIT;
                  psBenefit.description = `Plano de Saúde CLT${msgDaysWorked}`;
                  if (b.amountType === 'R$') {
                    psBenefit.value = +b.amountValue;
                  } else {
                    psBenefit.value =
                      (this.utilService.round(b.amountValue) / 100) *
                      computedSalary;
                  }
                  psBenefit.benefit = b;
                  _paymentComponents.push(psBenefit);

                  const notePSComponent = new PaymentComponent();
                  notePSComponent.type = PaymentComponentEnum.ANNOTATION;
                  notePSComponent.description = `Plano de Saúde`;
                  notePSComponent.value = psBenefit.value;

                  _paymentComponents.push(notePSComponent);

                  if (b.deductionValue > 0) {
                    let healthcareDiscount = 0;
                    if (b.deductionType === 'R$') {
                      healthcareDiscount = +b.deductionValue;
                    } else {
                      healthcareDiscount =
                        (this.utilService.round(b.deductionValue) / 100) *
                        computedSalary;
                    }
                    discountsFromBenefits += healthcareDiscount;

                    const psDiscount = new PaymentComponent();
                    psDiscount.type = PaymentComponentEnum.DISCOUNT;
                    psDiscount.description = `Desconto Plano de Saúde CLT${msgDaysWorked}`;
                    psDiscount.value = healthcareDiscount;
                    psDiscount.benefit = b;

                    _paymentComponents.push(psDiscount);
                  }

                  break;
                }
                case BenefitsEnum.RI: {
                  const refundInfraBenefit = new PaymentComponent();
                  refundInfraBenefit.type = PaymentComponentEnum.BENEFIT;
                  refundInfraBenefit.description = `Reembolso de Infraestrutura CLT${msgDaysWorked}`;
                  if (b.amountType === 'R$') {
                    refundInfraBenefit.value = +b.amountValue;
                  } else {
                    refundInfraBenefit.value =
                      (this.utilService.round(b.amountValue) / 100) *
                      computedSalary;
                  }
                  refundInfraBenefit.benefit = b;
                  _paymentComponents.push(refundInfraBenefit);

                  const noteRIComponent = new PaymentComponent();
                  noteRIComponent.type = PaymentComponentEnum.ANNOTATION;
                  noteRIComponent.description = `Reembolso de Infraestrutura`;
                  noteRIComponent.value = refundInfraBenefit.value;

                  _paymentComponents.push(noteRIComponent);

                  if (b.deductionValue > 0) {
                    let refundInfraDiscount = 0;
                    if (b.deductionType === 'R$') {
                      refundInfraDiscount = +b.deductionValue;
                    } else {
                      refundInfraDiscount =
                        (this.utilService.round(b.deductionValue) / 100) *
                        computedSalary;
                    }
                    discountsFromBenefits += refundInfraDiscount;

                    const riDiscount = new PaymentComponent();
                    riDiscount.type = PaymentComponentEnum.DISCOUNT;
                    riDiscount.description = `Desconto Reembolso de Infraestrutura CLT${msgDaysWorked}`;
                    riDiscount.value = refundInfraDiscount;
                    riDiscount.benefit = b;

                    _paymentComponents.push(riDiscount);
                  }

                  break;
                }
                case BenefitsEnum.GN: {
                  // Only in december
                  if (currentMonth.month() == 11) {
                    const christmasBonusPercentage = this.utilService.roundFromString(
                      await this.utilService.findSettingsByKey(
                        paymentKeys[
                        paymentKeys.BENEFIT_CHRISTMAS_BONUS_PERCENTAGE
                        ],
                      ),
                    );

                    const gnBenefit = new PaymentComponent();
                    gnBenefit.type = PaymentComponentEnum.BENEFIT;
                    gnBenefit.description = `Gratificação de Natal CLT`;
                    gnBenefit.value =
                      (christmasBonusPercentage / 100) * +payroll.salary;
                    gnBenefit.benefit = b;
                    _paymentComponents.push(gnBenefit);

                    const noteGNComponent = new PaymentComponent();
                    noteGNComponent.type = PaymentComponentEnum.ANNOTATION;
                    noteGNComponent.description = `Vale Creche`;
                    noteGNComponent.value = gnBenefit.value;

                    _paymentComponents.push(noteGNComponent);

                    if (+b.deductionValue > 0) {
                      let christmasBonusDiscount = 0;
                      if (b.deductionType === 'R$') {
                        christmasBonusDiscount = +b.deductionValue;
                      } else {
                        christmasBonusDiscount =
                          (this.utilService.round(b.deductionValue) / 100) *
                          computedSalary;
                      }

                      discountsFromBenefits += christmasBonusDiscount;

                      const gnDiscount = new PaymentComponent();
                      gnDiscount.type = PaymentComponentEnum.DISCOUNT;
                      gnDiscount.description = `Desconto Gratificação de Natal CLT${msgDaysWorked}`;
                      gnDiscount.value = christmasBonusDiscount;
                      gnDiscount.benefit = b;

                      _paymentComponents.push(gnDiscount);
                    }

                  }
                  break;
                }
                default: {
                  console.log(
                    `Unkown type of benefit: ${b.benefitType.name} (Code: ${b.benefitType.code})`,
                  );
                }
              }
            }

            // Salary Components
            const noteNetSalaryComponent = new PaymentComponent();
            noteNetSalaryComponent.type = PaymentComponentEnum.ANNOTATION;
            noteNetSalaryComponent.description = `Salário`;
            noteNetSalaryComponent.value = this.utilService.round(
              computedSalary - discountsFromBenefits,
            );
            noteNetSalaryComponent.notes = `Descontos : R$ ${discountsFromBenefits}`;

            _paymentComponents.push(noteNetSalaryComponent);

            const rawSalaryComponent = new PaymentComponent();
            rawSalaryComponent.type = PaymentComponentEnum.SALARY;
            rawSalaryComponent.description = `Salário Bruto CLT${msgDaysWorked}`;
            rawSalaryComponent.value = computedSalary;

            _paymentComponents.push(rawSalaryComponent);

            // Charges Components
            const chargeRate = await this.utilService.findSettingsByKey(
              institute.abbreviation.toUpperCase() == 'FASTEF'
                ? paymentKeys[paymentKeys.CHARGE_CLT_MONTHLY_FASTEF]
                : paymentKeys[paymentKeys.CHARGE_CLT_MONTHLY],
            );
            const cltCharges = new PaymentComponent();
            cltCharges.type = PaymentComponentEnum.CHARGES;
            cltCharges.description = `Encargos CLT${msgDaysWorked}`;
            cltCharges.value = this.utilService.round(
              computedSalary *
              (this.utilService.roundFromString(chargeRate) / 100),
            );
            _paymentComponents.push(cltCharges);

            const noteChargesComponent = new PaymentComponent();
            noteChargesComponent.type = PaymentComponentEnum.ANNOTATION;
            noteChargesComponent.description = `Encargos`;
            noteChargesComponent.value = cltCharges.value;

            _paymentComponents.push(noteChargesComponent);

            break;
          }

          case EmploymentRelationshipEnum.RPA_L: {
            // Net RPA Calculation: 11% INSS + 5% ISS + 20% Employer INSS Contribution + IRPF (based on database-managed quota range)
            // INSS = 11% * Raw Value
            // ISS = 5% * Raw Value
            // Employer INSS = 20% * Raw Value
            // IRRF = (Range Percentage * Raw Vale) - (Range Value)
            // ----------------------------------------------------
            // Company Cost = Raw Value + Employer INSS
            // Salary = Company Cost - (INSS + ISS + Employer INSS + IRRF)

            let totalDeductions = 0;

            // CHARGE_RAW_RPA_INSS,
            // CHARGE_RAW_RPA_ISS,
            // CHARGE_RAW_RPA_EMPLOYER_INSS

            // INSS
            const inssCharge = await this.utilService.findSettingsByKey(
              paymentKeys[paymentKeys.CHARGE_RAW_RPA_INSS],
            );

            const inss = new PaymentComponent();
            inss.type = PaymentComponentEnum.CHARGES;
            inss.description = `INSS (${inssCharge}%)`;
            inss.value = this.utilService.round(
              +payroll.salary *
              (this.utilService.roundFromString(inssCharge) / 100),
            );

            _paymentComponents.push(inss);

            // ISS
            const issCharge = await this.utilService.findSettingsByKey(
              paymentKeys[paymentKeys.CHARGE_RAW_RPA_ISS],
            );

            const iss = new PaymentComponent();
            iss.type = PaymentComponentEnum.CHARGES;
            iss.description = `ISS (${issCharge}%)`;
            iss.value = this.utilService.round(
              +payroll.salary *
              (this.utilService.roundFromString(issCharge) / 100),
            );

            _paymentComponents.push(iss);

            // Employer INSS
            const employerInssCharge = await this.utilService.findSettingsByKey(
              paymentKeys[paymentKeys.CHARGE_RAW_RPA_EMPLOYER_INSS],
            );

            const employerInss = new PaymentComponent();
            employerInss.type = PaymentComponentEnum.CHARGES;
            employerInss.description = `INSS Patronal (${employerInssCharge}%)`;
            employerInss.value = this.utilService.round(
              +payroll.salary *
              (this.utilService.roundFromString(employerInssCharge) / 100),
            );

            _paymentComponents.push(employerInss);

            // IRRF
            const irrfMap = await this.irrfRuleRepository.find({
              where: { 
                employmentRelationship: {
                  id: 6 /* RPA Bruto */ 
                },
              }
            });
            const irrfRange = irrfMap.find(
              r =>
                +payroll.salary - inss.value >= r.lowerLimit &&
                +payroll.salary - inss.value <= r.upperLimit,
            );

            const irrf = new PaymentComponent();
            irrf.type = PaymentComponentEnum.CHARGES;
            irrf.description = `IRRF (${irrfRange.quota}%)`;
            irrf.value = this.utilService.round(
              (+payroll.salary - inss.value) * (irrfRange.quota / 100) -
              irrfRange.deduction,
            );

            _paymentComponents.push(irrf);

            // RPA - charges and deductions
            totalDeductions = inss.value + iss.value + irrf.value;

            const noteChargesComponent = new PaymentComponent();
            noteChargesComponent.type = PaymentComponentEnum.ANNOTATION;
            noteChargesComponent.description = `Encargos`;
            noteChargesComponent.value = totalDeductions;

            _paymentComponents.push(noteChargesComponent);

            const salaryComponent = new PaymentComponent();
            salaryComponent.type = PaymentComponentEnum.SALARY;
            salaryComponent.description = `Pagamento RPA Líquido`;
            salaryComponent.value = this.utilService.round(
              +payroll.salary - totalDeductions,
            );

            _paymentComponents.push(salaryComponent);

            const noteSalaryComponent = new PaymentComponent();
            noteSalaryComponent.type = PaymentComponentEnum.ANNOTATION;
            noteSalaryComponent.description = `Salário`;
            noteSalaryComponent.value = salaryComponent.value;

            _paymentComponents.push(noteSalaryComponent);

            break;
          }

          case EmploymentRelationshipEnum.RPA_B: {
            // Raw RPA Calculation: 20% Employer INSS Contribution
            // Employer INSS = 20% * Raw Value
            // ----------------------------------------------------
            // Company Cost = Raw Value + Employer INSS
            // Salary = Raw Value

            // Employer INSS
            const employerInssCharge = await this.utilService.findSettingsByKey(
              paymentKeys[paymentKeys.CHARGE_RAW_RPA_EMPLOYER_INSS],
            );

            const employerInss = new PaymentComponent();
            employerInss.type = PaymentComponentEnum.CHARGES;
            employerInss.description = `INSS Patronal (${employerInssCharge}%)`;
            employerInss.value = this.utilService.round(
              payroll.salary *
              (this.utilService.roundFromString(employerInssCharge) / 100),
            );

            _paymentComponents.push(employerInss);

            const noteChargesComponent = new PaymentComponent();
            noteChargesComponent.type = PaymentComponentEnum.ANNOTATION;
            noteChargesComponent.description = `Encargos`;
            noteChargesComponent.value = employerInss.value;

            _paymentComponents.push(noteChargesComponent);

            const salaryComponent = new PaymentComponent();
            salaryComponent.type = PaymentComponentEnum.SALARY;
            salaryComponent.description = `Pagamento RPA Bruto`;
            salaryComponent.value = +payroll.salary;

            _paymentComponents.push(salaryComponent);

            const noteSalaryComponent = new PaymentComponent();
            noteSalaryComponent.type = PaymentComponentEnum.ANNOTATION;
            noteSalaryComponent.description = `Salário`;
            noteSalaryComponent.value = salaryComponent.value;

            _paymentComponents.push(noteSalaryComponent);

            break;
          }

          case EmploymentRelationshipEnum.B_ESTG: {
            const computedAllowance = this.utilService.round(
              (payroll.salary / defaultMonthDuration) * daysWorked,
            );

            // Benefits Components
            for (const b of payroll.benefits) {
              switch (b.benefitType.code) {
                case BenefitsEnum.VT: {
                  let transportPaidValue = 0;

                  if (institute.abbreviation == 'FASTEF') {
                    transportPaidValue = this.utilService.roundFromString(
                      await this.utilService.findSettingsByKey(
                        paymentKeys[
                        paymentKeys.BENEFIT_TRANSPORT_INTERNSHIP_FASTEF
                        ],
                      ),
                    );
                  } else {
                    const transportTicketValue = this.utilService.roundFromString(
                      await this.utilService.findSettingsByKey(
                        paymentKeys[paymentKeys.BENEFIT_TRANSPORT_TICKET_VALUE],
                      ),
                    );
                    transportPaidValue =
                      transportTicketValue *
                      (daysWorked != defaultMonthDuration
                        ? daysWorked
                        : businessDays - holidays.length);
                  }

                  const vtBenefit = new PaymentComponent();
                  vtBenefit.type = PaymentComponentEnum.BENEFIT;
                  vtBenefit.description = `Vale Transporte Bolsa Estágio${msgDaysWorked}`;
                  vtBenefit.value = +transportPaidValue;
                  vtBenefit.benefit = b;

                  _paymentComponents.push(vtBenefit);

                  const noteVTComponent = new PaymentComponent();
                  noteVTComponent.type = PaymentComponentEnum.ANNOTATION;
                  noteVTComponent.description = `Vale Transporte`;
                  noteVTComponent.value = vtBenefit.value;

                  _paymentComponents.push(noteVTComponent);

                  break;
                }
                case BenefitsEnum.RR: {
                  // Paid only at the last payroll month (enables updates on salary change)
                  if (currentMonth.isSame(dismissal, 'month')) {
                    const oneMonthPaidRecess =
                      +payroll.salary / defaultYearDuration;
                    const accumulatedPaidRecess = idxMonth * oneMonthPaidRecess;
                    const lastPaidRecess =
                      (computedAllowance / defaultYearDuration) *
                      (daysWorked / defaultMonthDuration);

                    const rrBenefit = new PaymentComponent();
                    rrBenefit.type = PaymentComponentEnum.BENEFIT;
                    rrBenefit.description = `Recesso Remunerado Bolsa Estágio`;
                    rrBenefit.value = accumulatedPaidRecess + lastPaidRecess;
                    rrBenefit.notes = `${idxMonth}x R$ ${oneMonthPaidRecess} + R$ ${lastPaidRecess}${msgDaysWorked}`;
                    rrBenefit.benefit = b;

                    _paymentComponents.push(rrBenefit);

                    const noteRRComponent = new PaymentComponent();
                    noteRRComponent.type = PaymentComponentEnum.ANNOTATION;
                    noteRRComponent.description = `Recesso Remunerado`;
                    noteRRComponent.value = rrBenefit.value;

                    _paymentComponents.push(noteRRComponent);

                  }

                  break;
                }
                case BenefitsEnum.GN: {
                  // Only in december
                  if (currentMonth.month() == 11) {
                    const christmasBonusPercentage = this.utilService.roundFromString(
                      await this.utilService.findSettingsByKey(
                        paymentKeys[
                        paymentKeys.BENEFIT_CHRISTMAS_BONUS_PERCENTAGE
                        ],
                      ),
                    );

                    const gnBenefit = new PaymentComponent();
                    gnBenefit.type = PaymentComponentEnum.BENEFIT;
                    gnBenefit.description = `Gratificação de Natal Bolsa Estágio`;
                    gnBenefit.value =
                      (christmasBonusPercentage / 100) * +payroll.salary;
                    gnBenefit.benefit = b;

                    _paymentComponents.push(gnBenefit);

                    const noteGNComponent = new PaymentComponent();
                    noteGNComponent.type = PaymentComponentEnum.ANNOTATION;
                    noteGNComponent.description = `Gratificação de Natal`;
                    noteGNComponent.value = gnBenefit.value;

                    _paymentComponents.push(noteGNComponent);

                  }
                  break;
                }
                default: {
                  console.log(
                    `Unkown type of benefit: ${b.benefitType.name} (Code: ${b.benefitType.code})`,
                  );
                }
              }
            }

            // Salary Components
            const salaryComponent = new PaymentComponent();
            salaryComponent.type = PaymentComponentEnum.SALARY;
            salaryComponent.description = `Bolsa Estágio${msgDaysWorked}`;
            salaryComponent.value = computedAllowance;

            _paymentComponents.push(salaryComponent);

            const noteSalaryComponent = new PaymentComponent();
            noteSalaryComponent.type = PaymentComponentEnum.ANNOTATION;
            noteSalaryComponent.description = `Salário`;
            noteSalaryComponent.value = salaryComponent.value;

            _paymentComponents.push(noteSalaryComponent);

            break;
          }
          case EmploymentRelationshipEnum.B_INOV: {
            const computedAllowance = this.utilService.round(
              (payroll.salary / defaultMonthDuration) * daysWorked,
            );

            // Benefits Components
            for (const b of payroll.benefits) {
              switch (b.benefitType.code) {
                case BenefitsEnum.VT: {
                  if (institute.abbreviation == 'IDESCO') {
                    const transportTicketValue = this.utilService.roundFromString(
                      await this.utilService.findSettingsByKey(
                        paymentKeys[paymentKeys.BENEFIT_TRANSPORT_TICKET_VALUE],
                      ),
                    );
                    const transportPaidValue =
                      transportTicketValue *
                      (daysWorked != defaultMonthDuration
                        ? daysWorked
                        : businessDays - holidays.length);

                    const vtBenefit = new PaymentComponent();
                    vtBenefit.type = PaymentComponentEnum.BENEFIT;
                    vtBenefit.description = `Vale Transporte Bolsa Inovação${msgDaysWorked}`;
                    vtBenefit.value = +transportPaidValue;
                    vtBenefit.benefit = b;

                    _paymentComponents.push(vtBenefit);

                    const noteVTComponent = new PaymentComponent();
                    noteVTComponent.type = PaymentComponentEnum.ANNOTATION;
                    noteVTComponent.description = `Vale Transporte`;
                    noteVTComponent.value = vtBenefit.value;

                    _paymentComponents.push(noteVTComponent);
                  }

                  break;
                }
                case BenefitsEnum.RR: {
                  if (institute.abbreviation == 'IDESCO') {
                    // Paid only at the last payroll month (enables updates on salary change)
                    if (currentMonth.isSame(dismissal, 'month')) {
                      const oneMonthPaidRecess =
                        +payroll.salary / defaultYearDuration;
                      const accumulatedPaidRecess =
                        idxMonth * oneMonthPaidRecess;
                      const lastPaidRecess =
                        (computedAllowance / defaultYearDuration) *
                        (daysWorked / defaultMonthDuration);

                      const rrBenefit = new PaymentComponent();
                      rrBenefit.type = PaymentComponentEnum.BENEFIT;
                      rrBenefit.description = `Recesso Remunerado Bolsa Inovação`;
                      rrBenefit.value = accumulatedPaidRecess + lastPaidRecess;
                      rrBenefit.notes = `${idxMonth}x R$ ${oneMonthPaidRecess} + R$ ${lastPaidRecess}${msgDaysWorked}`;
                      rrBenefit.benefit = b;

                      _paymentComponents.push(rrBenefit);

                      const noteRRComponent = new PaymentComponent();
                      noteRRComponent.type = PaymentComponentEnum.ANNOTATION;
                      noteRRComponent.description = `Recesso Remunerado`;
                      noteRRComponent.value = rrBenefit.value;

                      _paymentComponents.push(noteRRComponent);
                    }
                  }

                  break;
                }
                case BenefitsEnum.GN: {
                  if (
                    institute.abbreviation == 'IEPRO' ||
                    institute.abbreviation == 'IDESCO'
                  ) {
                    // Only in december
                    if (currentMonth.month() == 11) {
                      const christmasBonusPercentage = this.utilService.roundFromString(
                        await this.utilService.findSettingsByKey(
                          paymentKeys[
                          paymentKeys.BENEFIT_CHRISTMAS_BONUS_PERCENTAGE
                          ],
                        ),
                      );

                      const gnBenefit = new PaymentComponent();
                      gnBenefit.type = PaymentComponentEnum.BENEFIT;
                      gnBenefit.description = `Gratificação de Natal Bolsa Estágio`;
                      gnBenefit.value =
                        (christmasBonusPercentage / 100) * +payroll.salary;
                      gnBenefit.benefit = b;

                      _paymentComponents.push(gnBenefit);

                      const noteGNComponent = new PaymentComponent();
                      noteGNComponent.type = PaymentComponentEnum.ANNOTATION;
                      noteGNComponent.description = `Gratificação de Natal`;
                      noteGNComponent.value = gnBenefit.value;

                      _paymentComponents.push(noteGNComponent);
                    }
                  }
                  break;
                }
                default: {
                  console.log(
                    `Unkown type of benefit: ${b.benefitType.name} (Code: ${b.benefitType.code})`,
                  );
                }
              }
            }

            // Salary Components
            const salaryComponent = new PaymentComponent();
            salaryComponent.type = PaymentComponentEnum.SALARY;
            salaryComponent.description = `Bolsa Inovação${msgDaysWorked}`;
            salaryComponent.value = computedAllowance;

            _paymentComponents.push(salaryComponent);

            const noteSalaryComponent = new PaymentComponent();
            noteSalaryComponent.type = PaymentComponentEnum.ANNOTATION;
            noteSalaryComponent.description = `Salário`;
            noteSalaryComponent.value = salaryComponent.value;

            _paymentComponents.push(noteSalaryComponent);

            break;
          }
          case EmploymentRelationshipEnum.B_OUTR: {
            const computedAllowance = this.utilService.round(
              (payroll.salary / defaultMonthDuration) * daysWorked,
            );

            // Benefits Components
            for (const b of payroll.benefits) {
              switch (b.benefitType.code) {
                case BenefitsEnum.VT: {
                  if (institute.abbreviation == 'IDESCO') {
                    const transportTicketValue = this.utilService.roundFromString(
                      await this.utilService.findSettingsByKey(
                        paymentKeys[paymentKeys.BENEFIT_TRANSPORT_TICKET_VALUE],
                      ),
                    );
                    const transportPaidValue =
                      transportTicketValue *
                      (daysWorked != defaultMonthDuration
                        ? daysWorked
                        : businessDays - holidays.length);

                    const vtBenefit = new PaymentComponent();
                    vtBenefit.type = PaymentComponentEnum.BENEFIT;
                    vtBenefit.description = `Vale Transporte Bolsa Outorga${msgDaysWorked}`;
                    vtBenefit.value = +transportPaidValue;
                    vtBenefit.benefit = b;

                    _paymentComponents.push(vtBenefit);

                    const noteVTComponent = new PaymentComponent();
                    noteVTComponent.type = PaymentComponentEnum.ANNOTATION;
                    noteVTComponent.description = `Vale Transporte`;
                    noteVTComponent.value = vtBenefit.value;

                    _paymentComponents.push(noteVTComponent);
                  }

                  break;
                }
                case BenefitsEnum.RR: {
                  if (institute.abbreviation == 'IDESCO') {
                    // Paid only at the last payroll month (enables updates on salary change)
                    if (currentMonth.isSame(dismissal, 'month')) {
                      const oneMonthPaidRecess =
                        +payroll.salary / defaultYearDuration;
                      const accumulatedPaidRecess =
                        idxMonth * oneMonthPaidRecess;
                      const lastPaidRecess =
                        (computedAllowance / defaultYearDuration) *
                        (daysWorked / defaultMonthDuration);

                      const rrBenefit = new PaymentComponent();
                      rrBenefit.type = PaymentComponentEnum.BENEFIT;
                      rrBenefit.description = `Recesso Remunerado Bolsa Outorga`;
                      rrBenefit.value = accumulatedPaidRecess + lastPaidRecess;
                      rrBenefit.notes = `${idxMonth}x R$ ${oneMonthPaidRecess} + R$ ${lastPaidRecess}${msgDaysWorked}`;
                      rrBenefit.benefit = b;

                      _paymentComponents.push(rrBenefit);

                      const noteRRComponent = new PaymentComponent();
                      noteRRComponent.type = PaymentComponentEnum.ANNOTATION;
                      noteRRComponent.description = `Recesso Remunerado`;
                      noteRRComponent.value = rrBenefit.value;

                      _paymentComponents.push(noteRRComponent);
                    }
                  }

                  break;
                }
                case BenefitsEnum.GN: {
                  if (
                    institute.abbreviation == 'IEPRO' ||
                    institute.abbreviation == 'IDESCO'
                  ) {
                    // Only in december
                    if (currentMonth.month() == 11) {
                      const christmasBonusPercentage = this.utilService.roundFromString(
                        await this.utilService.findSettingsByKey(
                          paymentKeys[
                          paymentKeys.BENEFIT_CHRISTMAS_BONUS_PERCENTAGE
                          ],
                        ),
                      );

                      const gnBenefit = new PaymentComponent();
                      gnBenefit.type = PaymentComponentEnum.BENEFIT;
                      gnBenefit.description = `Gratificação de Natal Bolsa Estágio`;
                      gnBenefit.value =
                        (christmasBonusPercentage / 100) * +payroll.salary;
                      gnBenefit.benefit = b;

                      _paymentComponents.push(gnBenefit);

                      const noteGNComponent = new PaymentComponent();
                      noteGNComponent.type = PaymentComponentEnum.ANNOTATION;
                      noteGNComponent.description = `Gratificação de Natal`;
                      noteGNComponent.value = gnBenefit.value;

                      _paymentComponents.push(noteGNComponent);
                    }
                  }
                  break;
                }
                default: {
                  console.log(
                    `Unkown type of benefit: ${b.benefitType.name} (Code: ${b.benefitType.code})`,
                  );
                }
              }
            }

            // Salary Components
            const salaryComponent = new PaymentComponent();
            salaryComponent.type = PaymentComponentEnum.SALARY;
            salaryComponent.description = `Bolsa Outorga${msgDaysWorked}`;
            salaryComponent.value = computedAllowance;

            _paymentComponents.push(salaryComponent);

            const noteSalaryComponent = new PaymentComponent();
            noteSalaryComponent.type = PaymentComponentEnum.ANNOTATION;
            noteSalaryComponent.description = `Salário`;
            noteSalaryComponent.value = salaryComponent.value;

            _paymentComponents.push(noteSalaryComponent);

            break;
          }
          case EmploymentRelationshipEnum.B_PESQ: {
            const computedAllowance = this.utilService.round(
              (payroll.salary / defaultMonthDuration) * daysWorked,
            );

            // Benefits Components
            for (const b of payroll.benefits) {
              switch (b.benefitType.code) {
                case BenefitsEnum.GN: {
                  // Only in december
                  if (
                    currentMonth.month() == 11 &&
                    payroll.institute.abbreviation.includes('FASTEF')
                  ) {
                    const christmasBonusPercentage = this.utilService.roundFromString(
                      await this.utilService.findSettingsByKey(
                        paymentKeys[
                        paymentKeys.BENEFIT_CHRISTMAS_BONUS_PERCENTAGE
                        ],
                      ),
                    );

                    const gtFullValue =
                      (christmasBonusPercentage / 100) * +payroll.salary;
                    const remainingPayrollMonths = numberOfMonths - idxMonth;
                    const gtMonthlyBonus = this.utilService.round(
                      gtFullValue / remainingPayrollMonths,
                    );

                    // These values will be included in the Salary section
                    futureBonusDepositsFASTEF.remaining = remainingPayrollMonths;
                    futureBonusDepositsFASTEF.value = gtMonthlyBonus;

                    const noteGNComponent = new PaymentComponent();
                    noteGNComponent.type = PaymentComponentEnum.ANNOTATION;
                    noteGNComponent.description = `Gratificação de Natal`;
                    noteGNComponent.value = gtMonthlyBonus;

                    _paymentComponents.push(noteGNComponent);

                  }

                  break;
                }
                default: {
                  console.log(
                    `Unkown type of benefit: ${b.benefitType.name} (Code: ${b.benefitType.code})`,
                  );
                }
              }
            }

            // Salary Components
            const salaryComponent = new PaymentComponent();
            salaryComponent.type = PaymentComponentEnum.SALARY;
            salaryComponent.description = `Bolsa Outorga${msgDaysWorked}`;
            salaryComponent.value = computedAllowance;

            _paymentComponents.push(salaryComponent);

            const noteSalaryComponent = new PaymentComponent();
            noteSalaryComponent.type = PaymentComponentEnum.ANNOTATION;
            noteSalaryComponent.description = `Salário`;
            noteSalaryComponent.value = salaryComponent.value;

            _paymentComponents.push(noteSalaryComponent);

            // Christmas bonus for FASTEF, if needed
            if (
              payroll.institute.abbreviation.includes('FASTEF') &&
              futureBonusDepositsFASTEF.remaining > 0
            ) {
              const christmasBonusComponent = new PaymentComponent();
              christmasBonusComponent.type = PaymentComponentEnum.SALARY;
              christmasBonusComponent.description = `Gratificação de Natal Bolsa Pesquisa - FASTEF (mês ${futureBonusDepositsFASTEF.current +
                1})`;
              christmasBonusComponent.value = futureBonusDepositsFASTEF.value;

              futureBonusDepositsFASTEF.current += 1;
              futureBonusDepositsFASTEF.remaining -= 1;

              _paymentComponents.push(christmasBonusComponent);
            }

            break;
          }
          default: {
            console.log(
              `Unkown emplyment relationship: ${er.name} (Code: ${er.code})`,
            );
          }
        }

        _monthPaymentValue = _paymentComponents.reduce((accum, p) => {
          let value = 0;
          switch (p.type) {
            case PaymentComponentEnum.SALARY: {
              value = accum + p.value;
              break;
            }
            case PaymentComponentEnum.CHARGES:
            case PaymentComponentEnum.BENEFIT: {
              // value = accum + p.value + (p.leadCompensation ?? 0); // REMOVED :: COLLAB DISCOUNT ALREADY DOES THIS
              value = accum + p.value;
              break;
            }
            case PaymentComponentEnum.DISCOUNT: {
              value = accum - p.value;
              break;
            }
            case PaymentComponentEnum.ANNOTATION:
            default: {
              value = accum; // pass-through
              break;
            }
          }
          return value;
        }, _monthPaymentValue);

        // const monthPayment = <Payment>{
        //   year: currentMonth.format('YYYY').toString(),
        //   month: currentMonth.format('MM').toString(),
        //   components: _paymentComponents,
        //   totalValue: this.utilService.round(_monthPaymentValue),
        // };

        const monthPayment = new Payment();
        monthPayment.year = currentMonth.format('YYYY').toString();
        monthPayment.month = currentMonth.format('MM').toString();
        monthPayment.components = _paymentComponents;
        monthPayment.totalValue = this.utilService.round(_monthPaymentValue);
        monthPayment.payroll = payroll.id ? <PayRoll>{ id: payroll.id } : null;

        payroll.payments.push(monthPayment);
        currentMonth.add(1, 'month');
      } catch (e) {
        this.logger.error(
          `Error while creating payment for ${payroll.collaborator.name
          } on ${currentMonth.toDate()}`,
          e,
        );
      }
    }

    return payroll.payments;
  }

  benefitSummary(b: CreateBenefitDto | BenefitDto): string {
    const value =
      b.amountType == 'R$'
        ? `${b.amountType} ${b.amountValue}`
        : `${b.amountValue} ${b.amountType}`;
    const deduction =
      b.deductionType == 'R$'
        ? `- ${b.deductionType} ${b.deductionValue}`
        : `- ${b.deductionValue} ${b.deductionType}`;
    return `${b.benefitType.name} (${value}, ${deduction})`;
  }
}
