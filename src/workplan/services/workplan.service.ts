import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { classToPlain } from 'class-transformer';
import * as moment from 'moment-business-days';
import { I18nContext, I18nRequestScopeService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { AudityEntryDto } from '../../audit/interface/audit-entry.dto';
import { AuditService } from '../../audit/service/audit.service';
import { Project } from '../../projects/entity/project.entity';
import { ProjectsService } from '../../projects/services/projects.service';
import { SuppliersService } from '../../suppliers/services/suppliers.service';
import { Validity } from '../entity/validity.entity';
import { WorkplanItem } from '../entity/workplan-item.entity';
import { WPIBooksJournals } from '../entity/wpi-books-journals.entity';
import { WPICivilEngineering } from '../entity/wpi-civil-eng.entity';
import { WPICorrelated } from '../entity/wpi-correlated.entity';
import { WPIEquipmentAndSoftware } from '../entity/wpi-equipment-and-software.entity';
import { WPIEquipment } from '../entity/wpi-equipment.entity';
import { WPIHumanResources } from '../entity/wpi-human-resources.entity';
import { WPIInstituteCost } from '../entity/wpi-institute-cost.entity';
import { WPIService } from '../entity/wpi-service.entity';
import { WPISoftwareLicenses } from '../entity/wpi-software-licenses.entity';
import { WPISupplies } from '../entity/wpi-supplies.entity';
import { WPITraining } from '../entity/wpi-training.entity';
import { WPITrip } from '../entity/wpi-trip.entity';
import { BudgetCategoryEnum } from '../enums/budget-category.enum';
import { CreateWorkplanItemDto } from '../interfaces/create/create-workplan-item.dto';
import { MonthInfos } from '../interfaces/month-infos.dto';
import { WorkplanItemDto } from '../interfaces/workplan-item.dto';
import { WorkplanPlannedItemDto } from '../interfaces/workplan-planned-item.dto';
import { WPIBooksJournalsDto } from '../interfaces/wpi-books-journals.dto';
import { WPICivilEngineeringDto } from '../interfaces/wpi-civil-eng.dto';
import { WPICorrelatedDto } from '../interfaces/wpi-correlated.dto';
import { WPIEquipmentAndSoftwareDto } from '../interfaces/wpi-equipment-and-software.dto';
import { WPIEquipmentDto } from '../interfaces/wpi-equipment.dto';
import { WPIHumanResourcesDto } from '../interfaces/wpi-human-resources.dto';
import { WPIInstituteCostDto } from '../interfaces/wpi-institute-cost.dto';
import { WPIServiceDto } from '../interfaces/wpi-services.dto';
import { WPISoftwareLicensesDto } from '../interfaces/wpi-software-licenses.dto';
import { WPISuppliesDto } from '../interfaces/wpi-supplies.dto';
import { WPITrainingDto } from '../interfaces/wpi-training.dto';
import { WPITripDto } from '../interfaces/wpi-trip.dto';

moment.locale('pt-br');

@Injectable()
export class WorkplanService {

    constructor(
        @Inject('WORKPLAN_ITEM_REPOSITORY')
        private workplanItemRepository: Repository<WorkplanItem>,
        @Inject('VALIDITY_REPOSITORY')
        private validityRepository: Repository<Validity>,
        private readonly supplierService: SuppliersService,
        @Inject(forwardRef(() => ProjectsService))
        private readonly projectService: ProjectsService,
        private readonly auditService: AuditService,
        private readonly i18n: I18nRequestScopeService
    ) { }

    async workplanPlannedByProject(projectId: number, i18n: I18nContext): Promise<any> {
        const dbProject = await this.projectService.findOne(projectId);

        const dbEntities = await this.workplanItemRepository.find({
            where: { project: projectId, active: true },
            relations: ['project', 'wpiHR', 'wpiTrip', 'wpiTraining', 'wpiService',
                'wpiEquipment', 'wpiSoftwareLicenses', 'wpiEquipmentAndSoftware','wpiSupplies',
                'wpiBooksJournals', 'wpiCivilEngineering', 'wpiCorrelated', 'wpiInstituteCost', 'wpiFundPerMonth']
        });
        if (!dbEntities) {
            throw new NotFoundException(
                await i18n.translate('workplan.NOT_FOUND_BY_PROJECT', {
                    args: { id: projectId },
                })
            );
        }
        const returnBudgetCategory = [];


        for (const key in BudgetCategoryEnum) {
            let start = moment(dbProject.start);
            const end = moment(dbProject.end);
            const months = [];
            while (start.isBefore(end)){
                const formatedDate = start.format('MMM/YYYY');
                months.push({
                    amount: 0,
                    name: formatedDate
                })

                start = start.add(1, 'M');
            }
            months.map((dateInfos) => {
                const toUpper = dateInfos.name.split('/');
                dateInfos.name = `${toUpper[0].toUpperCase()}/${toUpper[1]}`
            });
            if (Object.prototype.hasOwnProperty.call(BudgetCategoryEnum, key)) {
                const element = BudgetCategoryEnum[key];
                returnBudgetCategory.push({
                    name: element,
                    amount: 0,
                    months: months
                })
            }
        }

        dbEntities.map(async (wpi) => {
            const currentCategoryName = wpi.category;

            const currentCategory = returnBudgetCategory.find(category => category.name == currentCategoryName)
            Object.entries(wpi.wpiFundPerMonth).map((wpiFPM) =>{
                currentCategory.amount += wpiFPM[1].value;
                let toUpper;
                if (`${wpiFPM[1].month}`.length == 1) {
                    toUpper = moment(`${wpiFPM[1].year}-0${wpiFPM[1].month}-01`).format('MMM/YYYY').split('/');
                } else {
                    toUpper = moment(`${wpiFPM[1].year}-${wpiFPM[1].month}-01`).format('MMM/YYYY').split('/');
                }

                const toFind = `${toUpper[0].toUpperCase()}/${toUpper[1]}`;

                currentCategory.months.map((monthInfo) => {
                    if(monthInfo.name == toFind){
                        monthInfo.amount += wpiFPM[1].value;
                    }
                });

            });

        });

        return returnBudgetCategory;
    }
    async buildWorkplanPlannedDto(dbEntity: WorkplanItem, returnBudgetCategory: Array<WorkplanPlannedItemDto>) : Promise<Array<WorkplanPlannedItemDto>> {
        let monthsDto: MonthInfos[] = await Promise.all(
            dbEntity.wpiFundPerMonth.map(async (monthInformation) => {
                if (`${monthInformation.month}`.length == 1) {
                    const withoutTheFirstLetter = moment(`${monthInformation.year}-0${monthInformation.month}-01`).format('MMMM/YYYY').slice(1);
                    return {
                        amount: monthInformation.value,
                        name: moment(`${monthInformation.year}-0${monthInformation.month}-01`).format('MMMM/YYYY').charAt(0).toUpperCase() + withoutTheFirstLetter,
                    }
                } else {
                    const withoutTheFirstLetter = moment(`${monthInformation.year}-${monthInformation.month}-01`).format('MMMM/YYYY').slice(1);
                    return {
                        amount: monthInformation.value,
                        name: moment(`${monthInformation.year}-${monthInformation.month}-01`).format('MMMM/YYYY').charAt(0).toUpperCase() + withoutTheFirstLetter,
                    }
                }

            })
        );

        let amountByBudgetCategory = 0;
        returnBudgetCategory.forEach((value) => {
            if (value.name == dbEntity.category) {
                Object.values(monthsDto).forEach((month, index) => {
                    for (const key in month) {
                        if (key == 'name') {
                            const element = month[key];
                            if (value.months.length != 0) {
                                Object.values(value.months).forEach((returnMonth) => {
                                    if (returnMonth.name == element) {
                                        returnMonth.amount += month['amount'];
                                        delete monthsDto[index];
                                    }
                                })
                            }
                        }
                        if (key == 'amount') {
                            const element = month[key];
                            amountByBudgetCategory += element;
                        }
                    }
                })
                monthsDto = monthsDto.filter(values => values !== null);
                value.amount += amountByBudgetCategory;
                value.months.push(...monthsDto);
            }
        });

        return returnBudgetCategory;
    }


    async create(dto: CreateWorkplanItemDto, auditEntry: AudityEntryDto): Promise<WorkplanItemDto> {

        const project = await this.projectService.findOne(dto.idProject);
        if (project && project.budget > 0) {
            const projectCurrentWorkplan = await this.getByProject(dto.idProject, null);
            const totalWorkplanValue = projectCurrentWorkplan.reduce((sum, wpi) => { return sum + wpi.value }, 0);

            if (totalWorkplanValue + dto.value > project.budget) {
                throw new BadRequestException(
                    await this.i18n.translate('workplan.VALIDATION.BUDGET_EXCEEDED')
                );
            }
        }

        const dbEntity = await this.buildWPIEntityFromDto(dto);

        this.workplanItemRepository.create(dbEntity);
        await this.workplanItemRepository.save(dbEntity);

        if (auditEntry) {
            auditEntry.actionType = 'CREATE';
            auditEntry.targetEntity = this.workplanItemRepository.metadata.targetName;
            auditEntry.targetTable = this.workplanItemRepository.metadata.tableName;
            auditEntry.targetEntityId = dbEntity.id;
            auditEntry.targetEntityBody = JSON.stringify(classToPlain(dbEntity));
            this.auditService.audit(auditEntry);
        }

        return <WorkplanItemDto>{
            id: dbEntity.id ?? -1,
            idProject: dbEntity.project.id,
            category: dbEntity.category,
            projectStage: dbEntity.projectStage,
            value: dbEntity.value,
            rationale: dbEntity.rationale,
            wpiHR: dto.wpiHR,
            wpiTrip: dto.wpiTrip,
            wpiTraining: dto.wpiTraining,
            wpiService: dto.wpiService,
            wpiEquipment: dto.wpiEquipment,
            wpiEquipmentAndSoftware: dto.wpiEquipmentAndSoftware,
            wpiSoftwareLicenses: dto.wpiSoftwareLicenses,
            wpiSupplies: dto.wpiSupplies,
            wpiBooksJournals: dto.wpiBooksJournals,
            wpiCivilEngineering: dto.wpiCivilEngineering,
            wpiCorrelated: dto.wpiCorrelated,
            wpiInstituteCost: dto.wpiInstituteCost,
            wpiFundPerMonth: dbEntity.wpiFundPerMonth
        };

    }

    async buildWPIEntityFromDto(dto: CreateWorkplanItemDto): Promise<WorkplanItem> {

        const dbEntity = new WorkplanItem();
        dbEntity.active = true;
        dbEntity.category = dto.category;
        dbEntity.project = new Project(dto.idProject);
        dbEntity.projectStage = dto.projectStage;
        dbEntity.rationale = dto.rationale;
        dbEntity.value = dto.value;
        dbEntity.wpiFundPerMonth = dto.wpiFundPerMonth;

        // Category based filling
        switch (dto.category) {
            case BudgetCategoryEnum.RH_DIRECT:
            case BudgetCategoryEnum.RH_INDIRECT: {
                const wpiHR = new WPIHumanResources();
                wpiHR.jobTitle = dto.wpiHR.jobTitle;
                wpiHR.educationLevel = dto.wpiHR.educationLevel;
                wpiHR.workingHours = dto.wpiHR.workingHours;

                dbEntity.wpiHR = wpiHR;
                break;
            }
            case BudgetCategoryEnum.TRIP: {
                const wpiTrip = new WPITrip();
                wpiTrip.event = dto.wpiTrip.event;
                wpiTrip.itinerary = dto.wpiTrip.itinerary;
                wpiTrip.passengerName = dto.wpiTrip.passengerName;
                wpiTrip.passengerCpf = dto.wpiTrip?.passengerCpf?.replace(/[ .-]/g, '');
                wpiTrip.start = moment(dto.wpiTrip.start, 'YYYY-MM-DD').toDate();
                wpiTrip.days = dto.wpiTrip.days;
                wpiTrip.quantity = dto.wpiTrip.quantity;

                dbEntity.wpiTrip = wpiTrip;
                break;
            }
            case BudgetCategoryEnum.TRAINING: {
                const wpiTraining = new WPITraining();
                wpiTraining.title = dto.wpiTraining.title;
                wpiTraining.instructorName = dto.wpiTraining.instructorName;
                wpiTraining.cnpj = dto.wpiTraining.cnpj?.replace(/[ .-]/g, '');
                wpiTraining.start = dto.wpiTraining.start && moment(dto.wpiTraining.start, 'YYYY-MM-DD').toDate();
                wpiTraining.end = dto.wpiTraining.end && moment(dto.wpiTraining.end, 'YYYY-MM-DD').toDate();

                dbEntity.wpiTraining = wpiTraining;
                break;
            }
            // case BudgetCategoryEnum.SERVICE_OTHER:
            case BudgetCategoryEnum.SERVICE_TECHNOLOGY: {
                const wpiService = new WPIService();
                wpiService.contractorName = dto.wpiService.contractorName;
                wpiService.cpf = dto.wpiService.cpf?.replace(/[ .-]/g, '');
                wpiService.cnpj = dto.wpiService.cnpj?.replace(/[ .-]/g, '');
                wpiService.description = dto.wpiService.description;
                wpiService.start = dto.wpiService.start && moment(dto.wpiService.start, 'YYYY-MM-DD').toDate();
                wpiService.end = dto.wpiService.end && moment(dto.wpiService.end, 'YYYY-MM-DD').toDate();

                dbEntity.wpiService = wpiService;
                break;
            }
            // case BudgetCategoryEnum.EQUIPMENT_OTHER:
            case BudgetCategoryEnum.EQUIPMENT_TECHNOLOGY: {
                const wpiEquipment = new WPIEquipment();
                wpiEquipment.equipmentName = dto.wpiEquipment.equipmentName;
                wpiEquipment.equipmentType = dto.wpiEquipment.equipmentType;
                wpiEquipment.equipmentModel = dto.wpiEquipment.equipmentModel;
                wpiEquipment.quantity = dto.wpiEquipment.quantity;
                wpiEquipment.purchaseDate = dto.wpiEquipment.purchaseDate && moment(dto.wpiEquipment.purchaseDate, 'MM-YYYY').toDate();

                dbEntity.wpiEquipment = wpiEquipment;
                break;
            }
            case BudgetCategoryEnum.SOFTWARE_LICENSES: {
                const wpiSoftwareLicenses = new WPISoftwareLicenses();
                wpiSoftwareLicenses.softwareName = dto.wpiSoftwareLicenses.softwareName;
                wpiSoftwareLicenses.validity = await this.validityRepository.findOne(dto.wpiSoftwareLicenses.validity);
                wpiSoftwareLicenses.quantity = dto.wpiSoftwareLicenses.quantity;
                wpiSoftwareLicenses.purchaseDate = dto.wpiSoftwareLicenses.purchaseDate && moment(dto.wpiSoftwareLicenses.purchaseDate, 'MM-YYYY').toDate();

                dbEntity.wpiSoftwareLicenses = wpiSoftwareLicenses;
                break;
            }
            case BudgetCategoryEnum.EQUIPMENT_AND_SOFTWARE: {
                const wpiEquipmentAndSoftware = new WPIEquipmentAndSoftware();
                wpiEquipmentAndSoftware.itemName = dto.wpiEquipmentAndSoftware.itemName;
                wpiEquipmentAndSoftware.itemType = dto.wpiEquipmentAndSoftware.itemType;
                wpiEquipmentAndSoftware.equipmentModel = dto.wpiEquipmentAndSoftware.equipmentModel;
                wpiEquipmentAndSoftware.validity = await this.validityRepository.findOne(dto.wpiEquipmentAndSoftware.validity);
                wpiEquipmentAndSoftware.quantity = dto.wpiEquipmentAndSoftware.quantity;
                wpiEquipmentAndSoftware.purchaseDate = dto.wpiEquipmentAndSoftware.purchaseDate && moment(dto.wpiEquipmentAndSoftware.purchaseDate, 'MM-YYYY').toDate();

                dbEntity.wpiEquipmentAndSoftware = wpiEquipmentAndSoftware;
                break;
            }
            case BudgetCategoryEnum.SUPPLIES_CONSUMPTION:
            case BudgetCategoryEnum.SUPPLIES_PROTOTYPE: {
                const wpiSupplies = new WPISupplies();
                wpiSupplies.description = dto.wpiSupplies.description;
                wpiSupplies.quantity = dto.wpiSupplies.quantity;
                wpiSupplies.accountingAppropriation = dto.wpiSupplies.accountingAppropriation;

                dbEntity.wpiSupplies = wpiSupplies;
                break;
            }
            case BudgetCategoryEnum.BOOKS_JOURNALS: {
                const wpiBooksJournals = new WPIBooksJournals();
                wpiBooksJournals.workTitle = dto.wpiBooksJournals.workTitle;
                wpiBooksJournals.quantity = dto.wpiBooksJournals.quantity;

                dbEntity.wpiBooksJournals = wpiBooksJournals;
                break;
            }
            case BudgetCategoryEnum.CIVIL_ENGINEERING: {
                const wpiCivilEngineering = new WPICivilEngineering();
                if (dto.wpiCivilEngineering.supplierId && dto.wpiCivilEngineering.supplierId > 0) {
                    wpiCivilEngineering.supplier = await this.supplierService.findOne(dto.wpiCivilEngineering.supplierId);
                    wpiCivilEngineering.supplierName = wpiCivilEngineering.supplier.name;
                } else {
                    wpiCivilEngineering.supplierName = dto.wpiCivilEngineering.supplierName;
                }
                wpiCivilEngineering.description = dto.wpiCivilEngineering.description;
                wpiCivilEngineering.accountingAppropriation = dto.wpiCivilEngineering.accountingAppropriation;

                dbEntity.wpiCivilEngineering = wpiCivilEngineering;
                break;
            }
            // case BudgetCategoryEnum.CORRELATED_INFRASTRUCTURE:
            case BudgetCategoryEnum.CORRELATED_OTHER: {
                const wpiCorrelated = new WPICorrelated();
                if (dto.wpiCorrelated.supplierId && dto.wpiCorrelated.supplierId > 0) {
                    wpiCorrelated.supplier = await this.supplierService.findOne(dto.wpiCivilEngineering.supplierId);
                    wpiCorrelated.supplierName = wpiCorrelated.supplier.name;
                } else {
                    wpiCorrelated.supplierName = dto.wpiCorrelated.supplierName;
                }
                wpiCorrelated.description = dto.wpiCorrelated.description;
                wpiCorrelated.accountingAppropriation = dto.wpiCorrelated.accountingAppropriation;

                dbEntity.wpiCorrelated = wpiCorrelated;
                break;
            }
            case BudgetCategoryEnum.INSTITUTE_COST: {
                const wpiInstituteCost = new WPIInstituteCost();
                wpiInstituteCost.description = dto.wpiInstituteCost.description;

                dbEntity.wpiInstituteCost = wpiInstituteCost;
                break;
            }
            default: {
                console.warn(`Workplan Item has unknown category: ${dto.category}`);
            }
        }

        return dbEntity;
    }

    async update(dto: WorkplanItemDto, auditEntry: AudityEntryDto): Promise<WorkplanItemDto> {

        let dbEntity = await this.workplanItemRepository.findOne(dto.id, { relations: ['project'] });
        dbEntity = await this.updateWPIEntityFromDto(dbEntity, dto);

        await this.workplanItemRepository.save(dbEntity);

        if (auditEntry) {
            auditEntry.actionType = 'UPDATE';
            auditEntry.targetEntity = this.workplanItemRepository.metadata.targetName;
            auditEntry.targetTable = this.workplanItemRepository.metadata.tableName;
            auditEntry.targetEntityId = dbEntity.id;
            auditEntry.targetEntityBody = JSON.stringify(classToPlain(dbEntity));
            this.auditService.audit(auditEntry);
        }

        const _dto = dto;

        return <WorkplanItemDto>{
            id: dbEntity.id,
            idProject: dbEntity.project.id,
            category: dbEntity.category,
            projectStage: dbEntity.projectStage,
            value: dbEntity.value,
            rationale: dbEntity.rationale,
            wpiHR: _dto.wpiHR,
            wpiTrip: _dto.wpiTrip,
            wpiTraining: _dto.wpiTraining,
            wpiService: _dto.wpiService,
            wpiEquipment: _dto.wpiEquipment,
            wpiEquipmentAndSoftware: _dto.wpiEquipmentAndSoftware,
            wpiSoftwareLicenses: _dto.wpiSoftwareLicenses,
            wpiSupplies: _dto.wpiSupplies,
            wpiBooksJournals: _dto.wpiBooksJournals,
            wpiCivilEngineering: _dto.wpiCivilEngineering,
            wpiCorrelated: _dto.wpiCorrelated,
            wpiInstituteCost: dto.wpiInstituteCost,
            wpiFundPerMonth: dbEntity.wpiFundPerMonth
        };

    }

    async updateWPIEntityFromDto(dbEntity: WorkplanItem, dto: CreateWorkplanItemDto): Promise<WorkplanItem> {

        // NOTE: Project and Category are not supposed to be changed
        // dbEntity.category = dto.category;
        // dbEntity.project = new Project(dto.idProject);

        dbEntity.projectStage = dto.projectStage;
        dbEntity.rationale = dto.rationale;
        dbEntity.value = dto.value;
        dbEntity.wpiFundPerMonth = dto.wpiFundPerMonth;

        // Category based filling
        switch (dto.category) {
            case BudgetCategoryEnum.RH_DIRECT:
            case BudgetCategoryEnum.RH_INDIRECT: {
                const wpiHR = new WPIHumanResources();
                wpiHR.jobTitle = dto.wpiHR.jobTitle;
                wpiHR.educationLevel = dto.wpiHR.educationLevel;
                wpiHR.workingHours = dto.wpiHR.workingHours;

                dbEntity.wpiHR = wpiHR;
                break;
            }
            case BudgetCategoryEnum.TRIP: {
                const wpiTrip = new WPITrip();
                wpiTrip.event = dto.wpiTrip.event;
                wpiTrip.itinerary = dto.wpiTrip.itinerary;
                wpiTrip.passengerName = dto.wpiTrip.passengerName;
                wpiTrip.passengerCpf = dto.wpiTrip.passengerCpf?.replace(/[ .-]/g, '');
                wpiTrip.start = moment(dto.wpiTrip.start, 'YYYY-MM-DD').toDate();
                wpiTrip.days = dto.wpiTrip.days;
                wpiTrip.quantity = dto.wpiTrip.quantity;

                dbEntity.wpiTrip = wpiTrip;
                break;
            }
            case BudgetCategoryEnum.TRAINING: {
                const wpiTraining = new WPITraining();
                wpiTraining.title = dto.wpiTraining.title;
                wpiTraining.instructorName = dto.wpiTraining.instructorName;
                wpiTraining.cnpj = dto.wpiTraining.cnpj?.replace(/[ .-]/g, '');
                if (dto.wpiTraining.start != '' && dto.wpiTraining.start != "NaN-NaN-NaN")
                    wpiTraining.start = moment(dto.wpiTraining.start, 'YYYY-MM-DD').toDate();
                if (dto.wpiTraining.end != '' && dto.wpiTraining.end != "NaN-NaN-NaN")
                    wpiTraining.end = moment(dto.wpiTraining.end, 'YYYY-MM-DD').toDate();

                dbEntity.wpiTraining = wpiTraining;
                break;
            }
            // case BudgetCategoryEnum.SERVICE_OTHER:
            case BudgetCategoryEnum.SERVICE_TECHNOLOGY: {
                const wpiService = new WPIService();
                wpiService.contractorName = dto.wpiService.contractorName;
                wpiService.cpf = dto.wpiService.cpf?.replace(/[ .-]/g, '');
                wpiService.cnpj = dto.wpiService.cnpj?.replace(/[ .-]/g, '');
                wpiService.description = dto.wpiService.description;
                if (dto.wpiService.start != '' && dto.wpiService.start != "NaN-NaN-NaN")
                    wpiService.start = moment(dto.wpiService.start, 'YYYY-MM-DD').toDate();
                if (dto.wpiService.end != '' && dto.wpiService.end != "NaN-NaN-NaN")
                    wpiService.end = moment(dto.wpiService.end, 'YYYY-MM-DD').toDate();

                dbEntity.wpiService = wpiService;
                break;
            }
            // case BudgetCategoryEnum.EQUIPMENT_OTHER:
            case BudgetCategoryEnum.EQUIPMENT_TECHNOLOGY: {
                const wpiEquipment = new WPIEquipment();
                wpiEquipment.equipmentName = dto.wpiEquipment.equipmentName;
                wpiEquipment.equipmentType = dto.wpiEquipment.equipmentType;
                wpiEquipment.equipmentModel = dto.wpiEquipment.equipmentModel;
                wpiEquipment.quantity = dto.wpiEquipment.quantity;
                wpiEquipment.purchaseDate = moment(dto.wpiEquipment.purchaseDate, 'MM-YYYY').toDate();

                dbEntity.wpiEquipment = wpiEquipment;
                break;
            }
            case BudgetCategoryEnum.SOFTWARE_LICENSES: {
                const wpiSoftwareLicenses = new WPISoftwareLicenses();
                wpiSoftwareLicenses.softwareName = dto.wpiSoftwareLicenses.softwareName;
                wpiSoftwareLicenses.validity = await this.validityRepository.findOne(dto.wpiSoftwareLicenses.validity);
                wpiSoftwareLicenses.quantity = dto.wpiSoftwareLicenses.quantity;
                wpiSoftwareLicenses.purchaseDate = moment(dto.wpiSoftwareLicenses.purchaseDate, 'MM-YYYY').toDate();

                dbEntity.wpiSoftwareLicenses = wpiSoftwareLicenses;
                break;
            }
            case BudgetCategoryEnum.EQUIPMENT_AND_SOFTWARE: {
                const wpiEquipmentAndSoftware = new WPIEquipmentAndSoftware();
                wpiEquipmentAndSoftware.itemName = dto.wpiEquipmentAndSoftware.itemName;
                wpiEquipmentAndSoftware.itemType = dto.wpiEquipmentAndSoftware.itemType;
                wpiEquipmentAndSoftware.equipmentModel = dto.wpiEquipmentAndSoftware.equipmentModel;
                wpiEquipmentAndSoftware.validity = await this.validityRepository.findOne(dto.wpiEquipmentAndSoftware.validity);
                wpiEquipmentAndSoftware.quantity = dto.wpiEquipmentAndSoftware.quantity;
                wpiEquipmentAndSoftware.purchaseDate = dto.wpiEquipmentAndSoftware.purchaseDate && moment(dto.wpiEquipmentAndSoftware.purchaseDate, 'MM-YYYY').toDate();

                dbEntity.wpiEquipmentAndSoftware = wpiEquipmentAndSoftware;
                break;
            }
            case BudgetCategoryEnum.SUPPLIES_CONSUMPTION:
            case BudgetCategoryEnum.SUPPLIES_PROTOTYPE: {
                const wpiSupplies = new WPISupplies();
                wpiSupplies.description = dto.wpiSupplies.description;
                wpiSupplies.quantity = dto.wpiSupplies.quantity;
                wpiSupplies.accountingAppropriation = dto.wpiSupplies.accountingAppropriation;

                dbEntity.wpiSupplies = wpiSupplies;
                break;
            }
            case BudgetCategoryEnum.BOOKS_JOURNALS: {
                const wpiBooksJournals = new WPIBooksJournals();
                wpiBooksJournals.workTitle = dto.wpiBooksJournals.workTitle;
                wpiBooksJournals.quantity = dto.wpiBooksJournals.quantity;

                dbEntity.wpiBooksJournals = wpiBooksJournals;
                break;
            }
            case BudgetCategoryEnum.CIVIL_ENGINEERING: {
                const wpiCivilEngineering = new WPICivilEngineering();
                if (dto.wpiCivilEngineering.supplierId && dto.wpiCivilEngineering.supplierId > 0) {
                    wpiCivilEngineering.supplier = await this.supplierService.findOne(dto.wpiCivilEngineering.supplierId);
                    wpiCivilEngineering.supplierName = wpiCivilEngineering.supplier.name;
                } else {
                    wpiCivilEngineering.supplierName = dto.wpiCivilEngineering.supplierName;
                }
                wpiCivilEngineering.description = dto.wpiCivilEngineering.description;
                wpiCivilEngineering.accountingAppropriation = dto.wpiCivilEngineering.accountingAppropriation;

                dbEntity.wpiCivilEngineering = wpiCivilEngineering;
                break;
            }
            // case BudgetCategoryEnum.CORRELATED_INFRASTRUCTURE:
            case BudgetCategoryEnum.CORRELATED_OTHER: {
                const wpiCorrelated = new WPICorrelated();
                if (dto.wpiCorrelated.supplierId && dto.wpiCorrelated.supplierId > 0) {
                    wpiCorrelated.supplier = await this.supplierService.findOne(dto.wpiCorrelated.supplierId);
                    wpiCorrelated.supplierName = wpiCorrelated.supplier.name;
                } else {
                    wpiCorrelated.supplierName = dto.wpiCorrelated.supplierName;
                }
                wpiCorrelated.description = dto.wpiCorrelated.description;
                wpiCorrelated.accountingAppropriation = dto.wpiCorrelated.accountingAppropriation;

                dbEntity.wpiCorrelated = wpiCorrelated;
                break;
            }
            case BudgetCategoryEnum.INSTITUTE_COST: {
                const wpiInstituteCost = new WPIInstituteCost();
                wpiInstituteCost.description = dto.wpiInstituteCost.description;

                dbEntity.wpiInstituteCost = wpiInstituteCost;
                break;
            }
            default: {
                console.warn(`Workplan Item has unknown category: ${dto.category}`);
            }
        }

        return dbEntity;
    }

    async getByProject(projectId: number, i18n: I18nContext): Promise<WorkplanItemDto[]> {

        try {

            const dbEntities = await this.workplanItemRepository.find({
                where: { project: projectId, active: true },
                // relations: ['project'
                    //, 'project.projectMembers', 'wpiFundPerMonth',
                    // 'wpiHR', 'wpiTrip', 'wpiTraining', 'wpiService',
                    // 'wpiEquipment', 'wpiSoftwareLicenses', 'wpiSupplies',
                    // 'wpiBooksJournals', 'wpiCivilEngineering', 'wpiCorrelated', 'wpiInstituteCost',
                    // ]
            });

            if (!dbEntities) {
                throw new NotFoundException(
                    await i18n.translate('workplan.NOT_FOUND_BY_PROJECT', {
                        args: { id: projectId },
                    })
                );
            }

            const dtos: WorkplanItemDto[] = [];
            for (const wpi of dbEntities) {
                const _wpi = await this.getWpiComponentByType(wpi);
                _wpi.project = <Project>{id: projectId};
                const dto = await this.buildWIPDtoFromEntity(_wpi);
                dtos.push(dto);
            }
            
            return dtos;

        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async getWpiComponentByType(wpi: WorkplanItem): Promise<WorkplanItem> {

        const _r = this.workplanItemRepository
            .createQueryBuilder('wpi')
            .innerJoinAndSelect('wpi.project', 'project')
            .innerJoinAndSelect('wpi.wpiFundPerMonth', 'fundPerMonth');
            
        // const _relations = ['project', 'wpiFundPerMonth'];
        switch (wpi.category) {
            case BudgetCategoryEnum.RH_DIRECT:
            case BudgetCategoryEnum.RH_INDIRECT: {
                // _relations.push('wpiHR');
                _r.innerJoinAndSelect('wpi.wpiHR', 'wpiHR');
                break;
            }
            case BudgetCategoryEnum.TRIP: {
                // _relations.push('wpiTrip');
                _r.innerJoinAndSelect('wpi.wpiTrip', 'wpiTrip');
                break;
            }
            case BudgetCategoryEnum.TRAINING: {
                // _relations.push('wpiTraining');
                _r.innerJoinAndSelect('wpi.wpiTraining', 'wpiTraining');
                break;
            }
            // case BudgetCategoryEnum.SERVICE_OTHER:
            case BudgetCategoryEnum.SERVICE_TECHNOLOGY: {
                // _relations.push('wpiService');
                _r.innerJoinAndSelect('wpi.wpiService', 'wpiService');
                break;
            }
            // case BudgetCategoryEnum.EQUIPMENT_OTHER:
            case BudgetCategoryEnum.EQUIPMENT_TECHNOLOGY: {
                // _relations.push('wpiEquipment');
                _r.innerJoinAndSelect('wpi.wpiEquipment', 'wpiEquipment');
                break;
            }
            case BudgetCategoryEnum.SOFTWARE_LICENSES: {
                // _relations.push('wpiSoftwareLicenses');
                _r.innerJoinAndSelect('wpi.wpiSoftwareLicenses', 'wpiSoftwareLicenses');
                _r.innerJoinAndSelect('wpiSoftwareLicenses.validity', 'validity');
                break;
            }
            case BudgetCategoryEnum.EQUIPMENT_AND_SOFTWARE: {
                _r.innerJoinAndSelect('wpi.wpiEquipmentAndSoftware', 'wpiEquipmentAndSoftware');
                _r.innerJoinAndSelect('wpiEquipmentAndSoftware.validity', 'validity');
                break;
            }
            case BudgetCategoryEnum.SUPPLIES_CONSUMPTION:
            case BudgetCategoryEnum.SUPPLIES_PROTOTYPE: {
                // _relations.push('wpiSupplies');
                _r.innerJoinAndSelect('wpi.wpiSupplies', 'wpiSupplies');
                break;
            }
            case BudgetCategoryEnum.BOOKS_JOURNALS: {
                // _relations.push('wpiBooksJournals');
                _r.innerJoinAndSelect('wpi.wpiBooksJournals', 'wpiBooksJournals');
                break;
            }
            case BudgetCategoryEnum.CIVIL_ENGINEERING: {
                // _relations.push('wpiCivilEngineering');
                _r.innerJoinAndSelect('wpi.wpiCivilEngineering', 'wpiCivilEngineering');
                break;
            }
            // case BudgetCategoryEnum.CORRELATED_INFRASTRUCTURE:
            case BudgetCategoryEnum.CORRELATED_OTHER: {
                // _relations.push('wpiCorrelated');
                _r.innerJoinAndSelect('wpi.wpiCorrelated', 'wpiCorrelated');
                break;
            }
            case BudgetCategoryEnum.INSTITUTE_COST: {
                // _relations.push('wpiInstituteCost');
                _r.innerJoinAndSelect('wpi.wpiInstituteCost', 'wpiInstituteCost');
                break;
            }
            default: {
                console.warn(`Workplan Item has unknown category: ${wpi.category}`);
            }

        }

        _r.where('wpi.id = :wpiId', { wpiId: wpi.id });

        // return await this.workplanItemRepository.findOne({where: { id: wpi.id }, relations: _relations});
        return await _r.getOne();
    }

    async getById(wpiId: number, i18n: I18nContext): Promise<WorkplanItemDto> {

        const dbEntity = await this.workplanItemRepository.findOne({
            where: { id: wpiId, active: true },
            relations: ['project', 'wpiHR', 'wpiTrip', 'wpiTraining', 'wpiService',
                'wpiEquipment', 'wpiSoftwareLicenses', 'wpiEquipmentAndSoftware', 'wpiSupplies', 'wpiBooksJournals',
                'wpiCivilEngineering', 'wpiCorrelated', 'wpiInstituteCost', 'wpiFundPerMonth']
        });

        if (!dbEntity) {
            throw new NotFoundException(
                await i18n.translate('workplan.NOT_FOUND', {
                    args: { id: wpiId },
                })
            );
        }

        const dto = await this.buildWIPDtoFromEntity(dbEntity);
        return dto;

    }

    async buildWIPDtoFromEntity(dbEntity: WorkplanItem): Promise<WorkplanItemDto> {

        const dto = <WorkplanItemDto>{};
        dto.id = dbEntity.id;
        dto.category = dbEntity.category;
        dto.idProject = dbEntity.project.id;
        dto.projectStage = dbEntity.projectStage;
        dto.rationale = dbEntity.rationale;
        dto.value = dbEntity.value;
        dto.wpiFundPerMonth = dbEntity.wpiFundPerMonth;

        // Category based filling
        switch (dbEntity.category) {
            case BudgetCategoryEnum.RH_DIRECT:
            case BudgetCategoryEnum.RH_INDIRECT: {

                const wpiHR = <WPIHumanResourcesDto>{};
                wpiHR.jobTitle = dbEntity.wpiHR.jobTitle;
                wpiHR.educationLevel = dbEntity.wpiHR.educationLevel;
                wpiHR.workingHours = dbEntity.wpiHR.workingHours;

                dto.wpiHR = wpiHR;
                break;
            }
            case BudgetCategoryEnum.TRIP: {
                const wpiTrip = new WPITripDto();
                wpiTrip.event = dbEntity.wpiTrip.event;
                wpiTrip.itinerary = dbEntity.wpiTrip.itinerary;
                wpiTrip.passengerName = dbEntity.wpiTrip.passengerName;
                wpiTrip.passengerCpf = dbEntity.wpiTrip.passengerCpf;
                wpiTrip.start = moment(dbEntity.wpiTrip.start).format('YYYY-MM-DD');
                wpiTrip.days = dbEntity.wpiTrip.days;
                wpiTrip.quantity = dbEntity.wpiTrip.quantity;

                dto.wpiTrip = wpiTrip;
                break;
            }
            case BudgetCategoryEnum.TRAINING: {
                const wpiTraining = new WPITrainingDto();
                wpiTraining.title = dbEntity.wpiTraining.title;
                wpiTraining.instructorName = dbEntity.wpiTraining.instructorName;
                wpiTraining.cnpj = dbEntity.wpiTraining.cnpj;
                wpiTraining.start = moment(dbEntity.wpiTraining.start).format('YYYY-MM-DD');
                wpiTraining.end = moment(dbEntity.wpiTraining.end).format('YYYY-MM-DD');

                dto.wpiTraining = wpiTraining;
                break;
            }
            // case BudgetCategoryEnum.SERVICE_OTHER:
            case BudgetCategoryEnum.SERVICE_TECHNOLOGY: {
                const wpiService = new WPIServiceDto();
                wpiService.contractorName = dbEntity.wpiService.contractorName;
                wpiService.cpf = dbEntity.wpiService.cpf;
                wpiService.cnpj = dbEntity.wpiService.cnpj;
                wpiService.description = dbEntity.wpiService.description;
                wpiService.start = moment(dbEntity.wpiService.start).format('YYYY-MM-DD');
                wpiService.end = moment(dbEntity.wpiService.end).format('YYYY-MM-DD');

                dto.wpiService = wpiService;
                break;
            }
            // case BudgetCategoryEnum.EQUIPMENT_OTHER:
            case BudgetCategoryEnum.EQUIPMENT_TECHNOLOGY: {
                const wpiEquipment = new WPIEquipmentDto();
                wpiEquipment.equipmentName = dbEntity.wpiEquipment.equipmentName;
                wpiEquipment.equipmentType = dbEntity.wpiEquipment.equipmentType;
                wpiEquipment.equipmentModel = dbEntity.wpiEquipment.equipmentModel;
                wpiEquipment.quantity = dbEntity.wpiEquipment.quantity;
                wpiEquipment.purchaseDate = moment(dbEntity.wpiEquipment.purchaseDate).format('MM-YYYY');

                dto.wpiEquipment = wpiEquipment;
                break;
            }
            case BudgetCategoryEnum.SOFTWARE_LICENSES: {
                const wpiSoftwareLicenses = new WPISoftwareLicensesDto();
                wpiSoftwareLicenses.softwareName = dbEntity.wpiSoftwareLicenses.softwareName;
                wpiSoftwareLicenses.validity = dbEntity.wpiSoftwareLicenses.validity?.id;
                wpiSoftwareLicenses.quantity = dbEntity.wpiSoftwareLicenses.quantity;
                wpiSoftwareLicenses.purchaseDate = moment(dbEntity.wpiSoftwareLicenses.purchaseDate).format('MM-YYYY');

                dto.wpiSoftwareLicenses = wpiSoftwareLicenses;
                break;
            }
            case BudgetCategoryEnum.EQUIPMENT_AND_SOFTWARE: {
                const wpiEquipmentAndSoftware = new WPIEquipmentAndSoftwareDto();
                wpiEquipmentAndSoftware.itemName = dbEntity.wpiEquipmentAndSoftware.itemName;
                wpiEquipmentAndSoftware.itemType = dbEntity.wpiEquipmentAndSoftware.itemType;
                wpiEquipmentAndSoftware.equipmentModel = dbEntity.wpiEquipmentAndSoftware.equipmentModel;
                wpiEquipmentAndSoftware.validity = dbEntity.wpiEquipmentAndSoftware.validity?.id;
                wpiEquipmentAndSoftware.quantity = dbEntity.wpiEquipmentAndSoftware.quantity;
                wpiEquipmentAndSoftware.purchaseDate = moment(dbEntity.wpiEquipmentAndSoftware.purchaseDate).format('MM-YYYY');

                dto.wpiEquipmentAndSoftware = wpiEquipmentAndSoftware;
                break;
            }
            case BudgetCategoryEnum.SUPPLIES_CONSUMPTION:
            case BudgetCategoryEnum.SUPPLIES_PROTOTYPE: {
                const wpiSupplies = new WPISuppliesDto();
                wpiSupplies.description = dbEntity.wpiSupplies.description;
                wpiSupplies.quantity = dbEntity.wpiSupplies.quantity;
                wpiSupplies.accountingAppropriation = dbEntity.wpiSupplies.accountingAppropriation;

                dto.wpiSupplies = wpiSupplies;
                break;
            }
            case BudgetCategoryEnum.BOOKS_JOURNALS: {
                const wpiBooksJournals = new WPIBooksJournalsDto();
                wpiBooksJournals.workTitle = dbEntity.wpiBooksJournals.workTitle;
                wpiBooksJournals.quantity = dbEntity.wpiBooksJournals.quantity;

                dto.wpiBooksJournals = wpiBooksJournals;
                break;
            }
            case BudgetCategoryEnum.CIVIL_ENGINEERING: {
                const wpiCivilEngineering = new WPICivilEngineeringDto();
                if (dbEntity.wpiCivilEngineering.supplier && dbEntity.wpiCivilEngineering.supplier.id > 0) {
                    wpiCivilEngineering.supplierId = dbEntity.wpiCivilEngineering.supplier.id;
                    wpiCivilEngineering.supplierName = dbEntity.wpiCivilEngineering.supplier.name;
                }
                wpiCivilEngineering.description = dbEntity.wpiCivilEngineering.description;
                wpiCivilEngineering.accountingAppropriation = dbEntity.wpiCivilEngineering.accountingAppropriation;
                wpiCivilEngineering.supplierName = dbEntity.wpiCivilEngineering.supplierName;

                dto.wpiCivilEngineering = wpiCivilEngineering;
                break;
            }
            // case BudgetCategoryEnum.CORRELATED_INFRASTRUCTURE:
            case BudgetCategoryEnum.CORRELATED_OTHER: {
                const wpiCorrelated = new WPICorrelatedDto();
                if (dbEntity.wpiCorrelated.supplier && dbEntity.wpiCorrelated.supplier.id > 0) {
                    wpiCorrelated.supplierId = dbEntity.wpiCorrelated.supplier.id;
                    wpiCorrelated.supplierName = dbEntity.wpiCorrelated.supplier.name;
                }
                wpiCorrelated.description = dbEntity.wpiCorrelated.description;
                wpiCorrelated.accountingAppropriation = dbEntity.wpiCorrelated.accountingAppropriation;
                wpiCorrelated.supplierName = dbEntity.wpiCorrelated.supplierName;

                dto.wpiCorrelated = wpiCorrelated;
                break;
            }
            case BudgetCategoryEnum.INSTITUTE_COST: {
                const wpiInstituteCost = new WPIInstituteCostDto();
                wpiInstituteCost.description = dbEntity.wpiInstituteCost.description;

                dto.wpiInstituteCost = wpiInstituteCost;
                break;
            }
            default: {
                console.warn(`Workplan Item has unknown category: ${dbEntity.category}`);
            }
        }

        return dto;
    }

    async delete(wpiId: number, i18n: I18nContext, auditEntry: AudityEntryDto): Promise<boolean> {

        let dbEntity = await this.workplanItemRepository.findOne(wpiId);

        if (!dbEntity) {
            throw new NotFoundException(
                await i18n.translate('workplan.NOT_FOUND', {
                    args: { id: wpiId },
                })
            );
        }

        dbEntity.active = false;
        dbEntity = await this.workplanItemRepository.save(dbEntity);

        if (auditEntry) {
            auditEntry.actionType = 'DELETE';
            auditEntry.targetEntity = this.workplanItemRepository.metadata.targetName;
            auditEntry.targetTable = this.workplanItemRepository.metadata.tableName;
            auditEntry.targetEntityId = dbEntity.id;
            auditEntry.targetEntityBody = '';
            this.auditService.audit(auditEntry);
        }

        return dbEntity.active === false;
    }

    async activate(wpiId: number, i18n: I18nContext, auditEntry: AudityEntryDto): Promise<boolean> {

        let dbEntity = await this.workplanItemRepository.findOne(wpiId);

        if (!dbEntity) {
            throw new NotFoundException(
                await i18n.translate('workplan.NOT_FOUND', {
                    args: { id: wpiId },
                })
            );
        }

        dbEntity.active = true;
        dbEntity = await this.workplanItemRepository.save(dbEntity);

        if (auditEntry) {
            auditEntry.actionType = 'DELETE';
            auditEntry.targetEntity = this.workplanItemRepository.metadata.targetName;
            auditEntry.targetTable = this.workplanItemRepository.metadata.tableName;
            auditEntry.targetEntityId = dbEntity.id;
            auditEntry.targetEntityBody = '';
            this.auditService.audit(auditEntry);
        }

        return dbEntity.active === true;
    }

    async getValidityList(): Promise<Validity[]> {
        return this.validityRepository.find();
    }

}
