/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';
import { diff } from 'deep-object-diff';
import * as filesize from "filesize";
import * as moment from 'moment';
import { I18nContext } from 'nestjs-i18n';
import { BudgetCategoryDto } from '../../suppliers/interfaces/budget-category.dto';
import { FindManyOptions, In, Raw, Repository } from "typeorm";
import { EmploymentRelationshipDto } from '../../collaborators/interfaces/employment-relationship.dto';
import { PayRollDto } from '../../collaborators/interfaces/payroll.dto';
import { DocumentsService } from '../../documents/services/documents.service';
import { FileManagementService } from '../../filemanagement/services/filemanagement.service';
import { ExpenseDto } from '../../suppliers/interfaces/expense.dto';
import { ExpenseService } from '../../suppliers/services/expense.service';
import { PaginationMetadataDto } from '../../util/interfaces/pagination-metadata.dto';
import { BudgetCategoryEnum } from '../../workplan/enums/budget-category.enum';
import { WorkplanItemDto } from '../../workplan/interfaces/workplan-item.dto';
import { WorkplanService } from '../../workplan/services/workplan.service';
import { ProjectMember } from '../entity/project-member.entity';
import { Project } from '../entity/project.entity';
import { CreateProjectMemberDto } from '../interfaces/create-project-member.dto';
import { CreateProjectDto } from '../interfaces/create-project.dto';
import { ExpenseGridDto } from '../interfaces/expense-grid.dto';
import { FinanceGridItemDto } from '../interfaces/finance-grid-item.dto';
import { MarginGridDto } from '../interfaces/margin-grid.dto';
import { ProjectDetailsDto } from '../interfaces/project-details.dto';
import { ProjectDropdownDto } from '../interfaces/project-dropdown.dto';
import { ProjectMemberDto } from '../interfaces/project-member.dto';
import { ProjectDto } from '../interfaces/project.dto';
import { UpdateProjectDto } from '../interfaces/update-project.dto';
import { AudityEntryDto } from './../../audit/interface/audit-entry.dto';
import { AuditService } from './../../audit/service/audit.service';
import { Collaborator } from './../../collaborators/entity/collaborator.entity';
import { CollaboratorDropdownDto } from './../../collaborators/interfaces/collaborator-dropdown.dto';
import { CollaboratorsService } from './../../collaborators/services/collaborators.service';
import { PayrollService } from './../../collaborators/services/payroll.service';
import { DocumentTypeDto } from './../../documents/interfaces/document-type.dto';
import { DocumentDto } from './../../documents/interfaces/document.dto';
import { FileTypeDto } from './../../documents/interfaces/file-type.dto';
import { InstitutesService } from './../../institutes/services/institutes.service';
import { BankService } from './bank.service';
import { ProjectMemberService } from './project-member.service';

moment.locale('pt-br');

@Injectable()
export class ProjectsService {

    constructor(
        @Inject('PROJECT_REPOSITORY')
        private projectRepository: Repository<Project>,
        private readonly bankService: BankService,
        @Inject(forwardRef(() => CollaboratorsService))
        private readonly collaboratorService: CollaboratorsService,
        private readonly documentService: DocumentsService,
        private readonly fileManagementService: FileManagementService,
        private readonly instituteService: InstitutesService,
        private readonly projectMembersService: ProjectMemberService,
        private readonly payRollService: PayrollService,
        @Inject(forwardRef(() => ExpenseService))
        private readonly expenseService: ExpenseService,
        private readonly workplanService: WorkplanService,
        private readonly auditService: AuditService
    ) { }

    async findAll(): Promise<Project[]> {
        return this.projectRepository.find();
    }

    async findInstituteByProjectId(id: number): Promise<any>{
        const project = await this.projectRepository.findOne({ where: { id: id }, relations: ['projectMembers', 'documents', 'institute'] })
        return {
            institute: project.institute.abbreviation
        }
    }

    async pagination(search: string, itemsPerPage = 10, isActive: boolean): Promise<PaginationMetadataDto> {
        const filters: FindManyOptions<Project> = {
            where: {
                active: isActive
            }
        };
        if (search && search.length > 0) {
            const nameFilters = search.split(' ').map(s => { return { name: Raw(alias => `${alias} ilike '%${s}%'`), active: true }; });
            filters.where = nameFilters;
        }

        const totalItems = await this.projectRepository.count({ ...filters });

        const paginationMetadata: PaginationMetadataDto = {
            totalItems,
            itemsPerPage: +itemsPerPage, // weird stuff here, always returning string
            totalPages: Math.ceil(totalItems / itemsPerPage)
        }

        return paginationMetadata;
    }

    async filteredCards(search: string, orderby: string, desc: boolean,
        itemsPerPage: number, page: number, isActive: boolean): Promise<Project[]> {
        
        let _nameFilters = "";
        search.length > 0 && search.split(' ').forEach(s => {
        _nameFilters = _nameFilters+ (_nameFilters.length > 0 ? ' OR ' : '' + `project.name ilike '%${s}%'`);
        });

        const _r = this.projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.institute', 'institute')
        .leftJoinAndSelect('project.projectMembers', 'projectMembers')
        .leftJoinAndSelect('project.workplan', 'workplan')
        .where('project.active = :isActive', { isActive } );
        
        if(_nameFilters.length > 0){
        _r.andWhere(_nameFilters);
        }

        if (orderby && orderby.length > 0) {
        _r.orderBy(orderby.includes('d') ? 'project.created' : 'project.name', desc ? 'DESC' : 'ASC');
        } else {
        _r.orderBy('project.name', 'ASC');
        }

        _r.take(itemsPerPage);
        _r.skip((page > 0 ? page - 1 : 0) * itemsPerPage);

        const result = await _r.getMany();

        return result;
    }

    async filteredCompact(stringSearch: string, isActive: boolean, _filters: any): Promise<ProjectDropdownDto[]> {

        const filters: FindManyOptions<Project> = {
            order: {
                name: "ASC"
            },
            where: {
                active: isActive
            },
            relations: ["institute"]
        };

        if (_filters) {
            if (_filters.institute && _filters.institute.length > 0) {
                filters.where['institute'] = {
                    id: In([..._filters.institute && _filters.institute.length > 0
                        && _filters.institute.split(',').map(elem => (elem))])
                }
            }
        }

        const result = await this.projectRepository.find(filters);

        return result.map(p => <ProjectDropdownDto>{
            id: p.id,
            name: p.name,
            institute: p.institute.abbreviation,
            start: p.start,
            end: p.end
        });
    }

    async findOne(id: number): Promise<Project> {
        return this.projectRepository.findOne({ where: { id: id }, relations: ['projectMembers', 'documents', 'institute'] });
    }

    async create(createProjectDto: CreateProjectDto, auditEntry: AudityEntryDto): Promise<ProjectDto> {

        const newProject = new Project();
        newProject.active = true;
        newProject.name = createProjectDto.name;
        newProject.start = moment(createProjectDto.start, "YYYY-MM-DD").toDate();
        newProject.end = moment(createProjectDto.end, "YYYY-MM-DD").toDate();
        newProject.budget = createProjectDto.budget;
        newProject.lastMargin = createProjectDto.budget;

        if (createProjectDto.institute) {
            newProject.institute = await this.instituteService.findOne(createProjectDto.institute);
        }

        if (createProjectDto.bank) {
            newProject.bank = await this.bankService.findOne(createProjectDto.bank);
        }
        if (createProjectDto.bankAgency) {
            newProject.bankAgency = createProjectDto.bankAgency;
        }
        if (createProjectDto.bankAccount) {
            newProject.bankAccount = createProjectDto.bankAccount;
        }

        if (createProjectDto.paymentOrder) {
            newProject.paymentOrder = createProjectDto.paymentOrder;
        }

        if (createProjectDto.projectManager) {
            newProject.projectManager = createProjectDto.projectManager;
        }

        if (createProjectDto.projectCoordinator) {
            newProject.projectCoordinator = createProjectDto.projectCoordinator;
        }

        if (createProjectDto.description) {
            newProject.description = createProjectDto.description;
        }
        if (createProjectDto.amendmentTerm) {
            newProject.amendmentTerm = createProjectDto.amendmentTerm;
        }
        if (createProjectDto.notes) {
            newProject.notes = createProjectDto.notes;
        }

        newProject.projectMembers = [];
        if (createProjectDto.projectMembers && createProjectDto.projectMembers.length > 0) {
            for (const pm of createProjectDto.projectMembers) {
                const c: Collaborator = await this.collaboratorService.findOne(pm.collaborator);
                const npm = new ProjectMember();
                npm.active = true;
                npm.collaborator = c;
                npm.jobTitle = pm.jobTitle;

                newProject.projectMembers.push(npm);
            }
        }

        newProject.documents = [];
        if (createProjectDto.documents && createProjectDto.documents.length > 0) {
            newProject.documents = await this.documentService.findByIds(createProjectDto.documents);
        }

        this.projectRepository.create(newProject);
        await this.projectRepository.save(newProject);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { documents, projectMembers, ...remaining } = createProjectDto;
        const projectMembersDto = newProject.projectMembers.map(pm => {
            const r = <ProjectMemberDto>{
                id: pm.id,
                collaborator: <CollaboratorDropdownDto>{
                    id: pm.collaborator.id,
                    name: pm.collaborator.name
                },
                jobTitle: pm.jobTitle
            };
            return r;
        }
        );

        // Documents movement on Storage + database update
        let refreshEntity = false;
        for (const doc of newProject.documents) {
            if (doc.url.includes('_CAPTIA_TEMP_PROJECT_ID_')) {
                // TODO: Replace with something not hardcoded
                refreshEntity = true;

                console.log(`doc.url = ${doc.url}`);
                const newPath = doc.url.replace(/_CAPTIA_TEMP_PROJECT_ID_/g, newProject.id.toString());
                console.log(`newPath = ${newPath}`);
                await this.fileManagementService.moveFileFromTempPath(doc.url, newPath);
                doc.url = newPath;
            }
        }

        if (refreshEntity) {
            await this.projectRepository.save(newProject);
        }

        const projectDocumentsDto = newProject.documents && newProject.documents.map(d => <DocumentDto>{
            id: d.id,
            filename: d.filename,
            documentType: d.documentType && <DocumentTypeDto>{
                id: d.documentType.id,
                name: d.documentType.name
            },
            fileType: d.fileType && <FileTypeDto>{
                id: d.fileType.id,
                name: d.fileType.name
            },
            created: moment(d.created).format('DD/MM/YYYY [às] HH:mm'),
            url: d.url,
            icon: d.fileType.icon,
            iconHighContrast: d.fileType.iconHighContrast,
        })


        if (auditEntry) {
            auditEntry.actionType = 'CREATE';
            auditEntry.targetEntity = this.projectRepository.metadata.targetName;
            auditEntry.targetTable = this.projectRepository.metadata.tableName;
            auditEntry.targetEntityId = newProject.id;
            auditEntry.targetEntityBody = JSON.stringify(classToPlain(newProject));
            this.auditService.audit(auditEntry);
        }
        return <ProjectDto>{
            id: newProject.id,
            ...remaining,
            projectMembers: projectMembersDto,
            documents: projectDocumentsDto,
        };
    }

    // async _calculateProjectFinanceGrids(project: Project, expenses: ExpenseDto[]) {

    //     const fg = <ExpenseGridDto>{            
    //         items: [],
    //         totalExpenses: 0,
    //         expensesRanking: []
    //     };

    //     let projectExpenses = 0;
    //     const expensesRanking: ExpensesRankingItemDto[] = [];

    //     const start = moment(project.start);
    //     const end = moment(project.end);
    //     const months = end.diff(start, 'months') + 1;

    //     const currentMonth = moment(start);
    //     let remainingBudget = this.round(project.budget);

    //     for (let cm = 0; cm < months; cm++) {
    //         const item = new FinanceGridItemDto();
    //         item.yearLabel = currentMonth.format('YYYY');
    //         item.monthLabel = currentMonth.format('MMM').toUpperCase();
    //         item.financeHeadings = new Map<string, number>();

    //         const startCurrentMonth = currentMonth.clone().startOf('month');
    //         const endCurrentMonth = currentMonth.clone().endOf('month');

    //         const currentMonthExpenses = expenses.filter(exp => 
    //             moment(exp.requestDate, 'DD/MM/YYYY')
    //             .isBetween(startCurrentMonth,endCurrentMonth, undefined, '[]')
    //         );

    //         let totalExpenses = 0;
    //         for(const exp of currentMonthExpenses){
    //             const bcCurrentValue = item.financeHeadings[(exp.budgetCategory.name)];
    //             if(!bcCurrentValue){
    //                 item.financeHeadings[exp.budgetCategory.name] = exp.value;
    //             } else {
    //                 item.financeHeadings[exp.budgetCategory.name] = bcCurrentValue + exp.value;
    //             }
    //             totalExpenses += exp.value;

    //             // Updating expenses ranking
    //             const rankingItem = expensesRanking.find(er => er.name == exp.budgetCategory.name);
    //             if(!rankingItem){
    //                 expensesRanking.push(<ExpensesRankingItemDto>{name: exp.budgetCategory.name, value: exp.value});
    //             } else {
    //                 rankingItem.value += exp.value;
    //             }
    //         }

    //         item.periodValue = this.round(remainingBudget - totalExpenses);
    //         remainingBudget = item.periodValue;
    //         projectExpenses += totalExpenses;

    //         fg.items.push(item);

    //         // move to next month
    //         currentMonth.add(1, 'month');
    //     }

    //     // Sorting expenses ranking
    //     expensesRanking.sort((a,b) => b.value - a.value).forEach((item,index)=> {item.order = index + 1});
    //     fg.expensesRanking = expensesRanking.slice(0, 3);

    //     fg.totalExpenses = project.budget - projectExpenses;
    // }

    headerTotalExpensesPerMonth(expensesGrid: any, hrPayments?: any){
        let currentDate: any = moment(new Date()).format("DD/MM/YYYY");
        let getCurrentMonth: any = moment(new Date()).format("DD/MMM/YYYY").split('/')[1].toUpperCase();
        currentDate = currentDate.split('/');
        let currentEg = expensesGrid.items.filter((financeGridItem) => {
            return [financeGridItem.yearLabel == currentDate[2] && financeGridItem.monthLabel == getCurrentMonth];
        });
        currentEg[0].periodValue += 2 * (hrPayments.filter((hrPayment) => hrPayment.year == currentDate[2] && hrPayment.month == currentDate[1] && hrPayment.paid == true)
        .map((hrPaymentitem) => hrPaymentitem.totalValue)
        .reduce((accumulator, currentValue) => {
            return accumulator + currentValue
        }, 0))
        return currentEg[0].periodValue;
    }

    async calculateProjectFinanceGrids(project: Project, expenses?: ExpenseDto[], expenseStatus?: string, workplanItens?: WorkplanItemDto[]): Promise<void> {

        if (!expenses) {
            expenses = await this.expenseService.getExpensesByProject(project.id, 'requestDate', false, null, null, null);
        }

        const mg = <MarginGridDto>{
            items: [],
            remainingPlannedMargin: 0,
        };

        const eg = <ExpenseGridDto>{
            items: [],
            totalExpenses: 0
        };

        // -----------------------------------------------------------------------------------------


        if(!workplanItens){
            workplanItens = await this.workplanService.getByProject(project.id, null);
        }

        const budgetCategoryMargins = this.generateFinanceHeadingsGridTemplate();

        for (const wpi of workplanItens) {
            const wpc = budgetCategoryMargins[wpi.category];
            if (!wpc) {
                budgetCategoryMargins[wpi.category] = this.round(wpi.value);
            } else {
                budgetCategoryMargins[wpi.category] += this.round(wpi.value);
            }
            // workplanRemainingMargin += wpi.value;
        }

        // -----------------------------------------------------------------------------------------

        let projectExpenses = 0;
        // const expensesRanking: ExpensesRankingItemDto[] = [];

        // -----------------------------------------------------------------------------------------

        const start = moment(project.start);
        const end = moment(project.end);
        const months = end.diff(start, 'months') + 1;

        const currentMonth = moment(start);
        let remainingBudget = this.round(project.budget);

        let cumulativeMarginFinanceHeadings = this.emptyFinanceHeadingsGrid();

        for (let cm = 0; cm < months; cm++) {
            // Update the margins from current month workplan items
            const currentMonthWpis = workplanItens
                .map(wpi => {
                    const _wpi = <WorkplanItemDto>{
                        id: wpi.id,
                        category: wpi.category,
                        wpiFundPerMonth: wpi.wpiFundPerMonth.filter(i =>
                            i.month == currentMonth.get('month') + 1
                            && i.year == currentMonth.get('year'))
                    }
                    if(_wpi.wpiFundPerMonth.length > 0) return _wpi;
                }).filter(wpi => wpi != undefined);
            cumulativeMarginFinanceHeadings = this.addCurrentMonthMarginToGrid
                (cumulativeMarginFinanceHeadings, currentMonthWpis);

            // -----------------------------------------------------------------------------------------

            const itemMG = new FinanceGridItemDto();
            itemMG.yearLabel = currentMonth.format('YYYY');
            itemMG.monthLabel = currentMonth.format('MMM').toUpperCase();
            itemMG.financeHeadings = this.copyFinanceHeadingsGrid(cumulativeMarginFinanceHeadings);

            const itemEG = new FinanceGridItemDto();
            itemEG.yearLabel = currentMonth.format('YYYY');
            itemEG.monthLabel = currentMonth.format('MMM').toUpperCase();
            itemEG.financeHeadings = this.generateFinanceHeadingsGridTemplate();

            // -----------------------------------------------------------------------------------------

            const startCurrentMonth = currentMonth.clone().startOf('month');
            const endCurrentMonth = currentMonth.clone().endOf('month');

            let monthExpenses = 0;
            const currentMonthExpenses = expenses.map(e =>
                <ExpenseDto>{
                    id: e.id,
                    budgetCategory: e.budgetCategory,
                    value: e.value,
                    installments: e.installments.filter(i => moment(i.paymentDate, 'YYYY-MM-DD')
                        .isBetween(startCurrentMonth, endCurrentMonth, undefined, '[]'))
                }
            ).filter(e => e.installments.length > 0);

            // -----------------------------------------------------------------------------------------

            for (const exp of currentMonthExpenses) {

                // Only expenses for the selected project; updated value from filtered installment list
                exp.installments = exp.installments.filter(i => i.project.id == project.id);
                exp.value = exp.installments.reduce((acc, item) => acc + +item.value, 0);

                // Margins
                const mgCurrentMonthValue = itemMG.financeHeadings[(exp.budgetCategory.code)];

                if (!mgCurrentMonthValue) {
                    // const initialMargin = budgetCategoryMargins[exp.budgetCategory.code];
                    itemMG.financeHeadings[exp.budgetCategory.code] = - exp.value;
                } else {
                    itemMG.financeHeadings[exp.budgetCategory.code] = mgCurrentMonthValue - exp.value;
                }

                // Expenses 
                const egCurrentValue = itemEG.financeHeadings[(exp.budgetCategory.code)];
                if (!egCurrentValue) {
                    itemEG.financeHeadings[exp.budgetCategory.code] = exp.value;
                } else {
                    itemEG.financeHeadings[exp.budgetCategory.code] = egCurrentValue + exp.value;
                }

                // Updating expenses ranking
                // const rankingItem = expensesRanking.find(er => er.name == exp.budgetCategory.code);
                // if (!rankingItem) {
                //     expensesRanking.push(<ExpensesRankingItemDto>{ name: exp.budgetCategory.code, value: exp.value });
                // } else {
                //     rankingItem.value += exp.value;
                // }

                monthExpenses += exp.value;
            }

            // itemMG.periodValue = this.round(workplanRemainingMargin - monthExpenses);            
            itemMG.periodValue = this.round(this.reduceFinanceHeadingsGridValues(itemMG.financeHeadings));
            // workplanRemainingMargin = itemMG.periodValue;

            // Update margins
            for (const key in itemMG.financeHeadings) {
                budgetCategoryMargins[key] = itemMG.financeHeadings[key];
            }

            itemEG.periodValue = this.round(monthExpenses);
            remainingBudget -= itemEG.periodValue;

            // Total expenses sum
            projectExpenses += monthExpenses;

            mg.items.push(itemMG);
            eg.items.push(itemEG);

            // Updates the current margins for the next month
            cumulativeMarginFinanceHeadings = this.copyFinanceHeadingsGrid(itemMG.financeHeadings);

            // move to next month
            currentMonth.add(1, 'month');
        }

        // mg.remainingPlannedMargin = workplanRemainingMargin;
        mg.remainingPlannedMargin = this.round(this.reduceFinanceHeadingsGridValues(cumulativeMarginFinanceHeadings));

        // Sorting expenses ranking
        // expensesRanking.sort((a, b) => b.value - a.value).forEach((item, index) => { item.order = index + 1 });
        // eg.expensesRanking = expensesRanking.slice(0, 3);

        eg.remainingRealMargin = remainingBudget;
        eg.totalExpenses = projectExpenses;

        // Setting grids
        project.marginsGrid = mg;
        project.expensesGrid = eg;

        // Updating last margin
        if(expenseStatus == 'undefined'){
            project.lastMargin = project.expensesGrid.remainingRealMargin;
        }

        await this.projectRepository.save(project);

    }

    async updateProjectMargin(projectId: number): Promise<void> {

        const project = await this.projectRepository.findOne({ where: { id: projectId}});

        const totalExpenses = await this.expenseService.getTotalExpensesByProject(project.id, null, null);

        project.lastMargin = this.round(project.budget - totalExpenses);
        await this.projectRepository.save(project);

    }

    generateFinanceHeadingsGridTemplate(): Map<string, number> {
        const grid = new Map<string, number>();
        for (const bc in BudgetCategoryEnum) {
            grid[bc] = 0;
        }
        return grid;
    }

    copyFinanceHeadingsGrid(referenceGrid: Map<string, number>): Map<string, number> {
        const grid = new Map<string, number>();
        for (const bc in BudgetCategoryEnum) {
            grid[bc] = referenceGrid[bc];
        }
        return grid;
    }

    emptyFinanceHeadingsGrid(): Map<string, number> {
        const grid = new Map<string, number>();
        for (const bc in BudgetCategoryEnum) {
            grid[bc] = 0;
        }
        return grid;
    }

    reduceFinanceHeadingsGridValues(referenceGrid: Map<string, number>): number {
        let sum = 0;
        for (const bc in BudgetCategoryEnum) {
            sum += referenceGrid[bc];
        }
        return sum;
    }

    addCurrentMonthMarginToGrid(grid: Map<string, number>, monthWpis: WorkplanItemDto[]): Map<string, number> {
        for (const bc in BudgetCategoryEnum) {
            grid[bc] = grid[bc] + monthWpis.filter(wpi => wpi.category == bc)
                .reduce((acc, wpi) => acc +
                    wpi.wpiFundPerMonth.reduce((sum, item) => sum + +item.value, 0)
                    ,0);
        }
        return grid;
    }

    async getById(projectId: number, expenseStatus: string, i18n: I18nContext, auditEntry: AudityEntryDto): Promise<ProjectDetailsDto> {
        // const dbProject = await this.projectRepository.findOne(projectId,
        //     {
        //         relations: ['documents', 'institute', 'bank', 'projectExtension']
        //     });
        
        const _r = this.projectRepository
            .createQueryBuilder('project')
            .innerJoinAndSelect('project.institute', 'institute')
            .leftJoinAndSelect('project.documents', 'documents')
            .leftJoinAndSelect('documents.fileType', 'fileType')
            .leftJoinAndSelect('documents.documentType', 'documentType')
            .leftJoinAndSelect('project.bank', 'bank')
            .leftJoinAndSelect('project.projectMembers', 'projectMembers')
            .leftJoinAndSelect('projectMembers.collaborator', 'collaborator')
            .leftJoinAndSelect('collaborator.payroll', 'payroll')
            .leftJoinAndSelect('payroll.employmentRelationship', 'employmentRelationship')
            .leftJoinAndSelect('payroll.budgetCategory', 'budgetCategory')
            .leftJoinAndSelect('project.projectExtension', 'projectExtension')
            .where('project.id = :projectId', { projectId });

        const dbProject = await _r.getOne();

        if (!dbProject) {
            throw new NotFoundException(
                await I18nContext.current().translate('project.NOT_FOUND', {
                    args: { id: projectId },
                })
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { documents, institute, projectMembers, ...remaining } = dbProject;
        const projectDocumentsDto = dbProject.documents && dbProject.documents.map(d => <DocumentDto>{
            id: d.id,
            filename: d.filename,
            url: d.url,
            icon: d.fileType.icon,
            iconHighContrast: d.fileType.iconHighContrast,
            size: filesize.filesize(d.size),
            created: moment(d.created).format('DD/MM/YYYY [às] HH:mm'),
            documentType: d.documentType && <DocumentTypeDto>{
                id: d.documentType.id,
                name: d.documentType.name
            },
            fileType: d.fileType && <FileTypeDto>{
                id: d.fileType.id,
                name: d.fileType.name
            }
        });

        // for (const pm of dbProject.projectMembers) {
        //     const payroll = await this.payRollService.loadPayrollByCollaboratorAndProject(pm.collaborator.id, projectId);
        //     if (!payroll) {
        //         pm.collaborator.payroll = null;
        //     }
        //     else if(payroll.active) {
        //         pm.collaborator.payroll = [];
        //         pm.collaborator.payroll.push(payroll);
        //     }
        // }

        let projectMembersDto = dbProject.projectMembers &&
            dbProject.projectMembers.filter(pm => pm.collaborator.payroll).map(pm => <ProjectMemberDto>{
                id: pm.id,
                jobTitle: pm.jobTitle,
                collaborator: {
                    id: pm.collaborator.id,
                    name: pm.collaborator.name,
                    image: pm.collaborator.image,
                    active: pm.collaborator.active,
                    payRoll: pm.collaborator.payroll.map(p => <PayRollDto>{
                        id: p.id,
                        active: p.active,
                        admission: moment(p.admission).format('YYYY-MM-DD'),
                        dismissal: p.dismissal != null ? moment(p.dismissal).format('YYYY-MM-DD') : "Não definitivo",
                        employmentRelationship: <EmploymentRelationshipDto>{
                            id: p.employmentRelationship.id,
                            name: p.employmentRelationship.name
                        },
                        salary: p.salary,
                        workload: p.workload,
                        budgetCategory: <BudgetCategoryDto>{
                            id: p.budgetCategory.id,
                            name: p.budgetCategory.name,
                            code: p.budgetCategory.code
                        }
                    })
                }
            });

        const _payments = await this.payRollService.getPaymentsByProject(dbProject.id, true);
        
        try {
            
            const _expenses = await this.expenseService.getExpensesByProject(dbProject.id, 'requestDate', false, expenseStatus, _payments, i18n, auditEntry);
            const _hrPayments = await this.expenseService.getHrPaymentsByProject(dbProject.id, _payments, i18n, auditEntry);
            const _workplan = await this.workplanService.getByProject(dbProject.id, i18n);
            
            await this.calculateProjectFinanceGrids(dbProject, _expenses, expenseStatus, _workplan);
            
            projectMembersDto = projectMembersDto.filter(pm => pm.collaborator.active != false);
            const headerTotalExpenses = this.headerTotalExpensesPerMonth(dbProject.expensesGrid, _hrPayments);

            return <ProjectDetailsDto>{
                id: dbProject.id,
                name: dbProject.name,
                headerTotalExpenses: headerTotalExpenses,
                description: dbProject.description,
                start: dbProject.start ? moment(dbProject.start).format('DD/MM/YYYY') : '',
                end: dbProject.end ? moment(dbProject.end).format('DD/MM/YYYY') : '',
                institute: {
                    id: dbProject.institute.id,
                    name: dbProject.institute.name,
                    abbreviation: dbProject.institute.abbreviation
                },
                budget: dbProject.budget,
                bank: {
                    id: dbProject.bank?.id,
                    name: dbProject.bank?.name,
                    code: dbProject.bank?.code
                },
                amendmentTerm: dbProject.amendmentTerm,
                bankAgency: dbProject.bankAgency,
                bankAccount: dbProject.bankAccount,
                paymentOrder: dbProject.paymentOrder,
                projectManager: dbProject.projectManager,
                projectCoordinator: dbProject.projectCoordinator,
                notes: dbProject.notes,
                projectMembers: projectMembersDto,
                documents: projectDocumentsDto,
                marginsGrid: dbProject.marginsGrid,
                expensesGrid: dbProject.expensesGrid,
                workplan: _workplan,
                expenses: _expenses,
                hrPayments: _hrPayments,
                lastMargin: dbProject.lastMargin,
                remainingMarginPercentage: dbProject.remainingMarginPercentage,
                utilizedFundsPercentage: dbProject.utilizedFundsPercentage
            };
        } catch (error) {
            console.error(error);
        }

        return null;

    }

    async update(updateProjectDto: UpdateProjectDto, auditEntry: AudityEntryDto): Promise<ProjectDto> {

        const dbProject = await this.findOne(updateProjectDto.id);

        if (!dbProject) {
            throw new NotFoundException(
                await I18nContext.current().translate('project.NOT_FOUND', {
                    args: { id: updateProjectDto.id },
                })
            );
        }

        const _plainCopy = classToPlain(dbProject);

        dbProject.name = updateProjectDto.name,
            dbProject.start = moment(updateProjectDto.start, "YYYY-MM-DD").toDate();
        dbProject.end = moment(updateProjectDto.end, "YYYY-MM-DD").toDate();

        // Adding extra value to the margin if project budget has been adjusted
        if (dbProject.budget != updateProjectDto.budget) {
            dbProject.lastMargin += (updateProjectDto.budget - dbProject.budget);
        }

        dbProject.budget = updateProjectDto.budget;

        if(updateProjectDto.paymentOrder != null && updateProjectDto.paymentOrder.replace(/\s/g,"") == ""){
            dbProject.paymentOrder = null;
        }
        if(updateProjectDto.projectManager != null && updateProjectDto.projectManager.replace(/\s/g,"") == ""){
            dbProject.projectManager = null;
        }
        if(updateProjectDto.projectCoordinator != null && updateProjectDto.projectCoordinator.replace(/\s/g,"") == ""){
            dbProject.projectCoordinator = null;
        }
        if (updateProjectDto.institute) {
            dbProject.institute = await this.instituteService.findOne(updateProjectDto.institute);
            if (!dbProject.institute) {
                throw new NotFoundException(
                    await I18nContext.current().translate('project.VALIDATION.INSTITUTE.NOT_FOUND', {
                        args: { id: updateProjectDto.id },
                    })
                );
            }
        } else {
            throw new BadRequestException(
                await I18nContext.current().translate('project.VALIDATION.INSTITUTE.REQUIRED', {
                    args: { id: updateProjectDto.id },
                })
            );
        }

        if (updateProjectDto.bank) {
            dbProject.bank = await this.bankService.findOne(updateProjectDto.bank);
            if (!dbProject.bank) {
                throw new NotFoundException(
                    await I18nContext.current().translate('project.VALIDATION.BANK.NOT_FOUND', {
                        args: { id: updateProjectDto.id },
                    })
                );
            }
        }

        dbProject.bankAgency = updateProjectDto.bankAgency;
        dbProject.bankAccount = updateProjectDto.bankAccount;

        if (updateProjectDto.description) {
            dbProject.description = updateProjectDto.description;
        }
        if (updateProjectDto.amendmentTerm) {
            dbProject.amendmentTerm = updateProjectDto.amendmentTerm;
        }
        if (updateProjectDto.notes) {
            dbProject.notes = updateProjectDto.notes;
        }
        if (updateProjectDto.paymentOrder) {
            dbProject.paymentOrder = updateProjectDto.paymentOrder;
        }
        if (updateProjectDto.projectManager) {
            dbProject.projectManager = updateProjectDto.projectManager;
        }
        if (updateProjectDto.projectCoordinator) {
            dbProject.projectCoordinator = updateProjectDto.projectCoordinator;
        }

        // Project members are not set on create or update anymore
        // let projectMembersToBeDeleted: ProjectMember[] = [];
        // if (updateProjectDto.projectMembers) {

        //     const updatedProjectMembersList: ProjectMember[] = [];
        //     for (const upm of updateProjectDto.projectMembers) {

        //         // Case 1: Project member already exists - updates job description
        //         if (upm.id && upm.id > 0) {
        //             const pm = await this.projectMembersService.findOne(upm.id);
        //             pm.jobTitle = upm.jobTitle;
        //             updatedProjectMembersList.push(pm);
        //         } else {
        //             // Case 2: New projecy member
        //             const c: Collaborator = await this.collaboratorService.findOne(upm.collaborator);
        //             const npm = new ProjectMember();
        //             npm.active = true;
        //             npm.collaborator = c;
        //             npm.jobTitle = upm.jobTitle;
        //             updatedProjectMembersList.push(npm);
        //         }
        //     }

        //     projectMembersToBeDeleted = dbProject.projectMembers.filter(pm =>
        //         !updatedProjectMembersList.find(upm => upm.id && upm.id == pm.id));
        //     dbProject.projectMembers = updatedProjectMembersList;
        // }

        if (updateProjectDto.documents) {
            dbProject.documents = await this.documentService.findByIds(updateProjectDto.documents);
        }

        await this.projectRepository.save(dbProject);

        // Deleting orphan project members
        // const pmOrphans = projectMembersToBeDeleted.map(pm => pm.id);
        // if (pmOrphans && pmOrphans.length > 0) {
        //     this.projectMembersService.deleteOrphan(pmOrphans);
        // }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { documents, projectMembers, ...remaining } = updateProjectDto;
        const projectMembersDto = dbProject.projectMembers.map(pm => <ProjectMemberDto>{
            id: pm.id,
            collaborator: <CollaboratorDropdownDto>{
                id: pm.collaborator.id,
                name: pm.collaborator.name
            },
            jobTitle: pm.jobTitle
        });

        // Documents movement on Storage + database update
        let refreshEntity = false;
        for (const doc of dbProject.documents) {
            if (doc.url.includes('_CAPTIA_TEMP_PROJECT_ID_')) {
                refreshEntity = true;
                // TODO: Replace with something not hardcoded
                const newPath = doc.url.replace(/_CAPTIA_TEMP_PROJECT_ID_/g, dbProject.id.toString());
                await this.fileManagementService.moveFileFromTempPath(doc.url, newPath);
                doc.url = newPath;
            }
        }

        if (refreshEntity) {
            await this.projectRepository.save(dbProject);
        }

        const projectDocumentsDto = dbProject.documents.map(d => <DocumentDto>{
            id: d.id,
            filename: d.filename,
            documentType: d.documentType && <DocumentTypeDto>{
                id: d.documentType.id,
                name: d.documentType.name
            },
            fileType: d.fileType && <FileTypeDto>{
                id: d.fileType.id,
                name: d.fileType.name
            },
            created: moment(d.created).format('DD/MM/YYYY [às] HH:mm'),
            url: d.url,
            icon: d.fileType.icon,
            iconHighContrast: d.fileType.iconHighContrast,
        })


        if (auditEntry) {
            const _originalCopy = plainToClass(Project, _plainCopy);
            const _diff = diff(_originalCopy, dbProject);

            auditEntry.actionType = 'UPDATE';
            auditEntry.targetEntity = this.projectRepository.metadata.targetName;
            auditEntry.targetTable = this.projectRepository.metadata.tableName;
            auditEntry.targetEntityId = dbProject.id;
            auditEntry.targetEntityBody = JSON.stringify(_diff);
            this.auditService.audit(auditEntry);
        }

        return <ProjectDto>{
            id: dbProject.id,
            projectMembers: projectMembersDto,
            documents: projectDocumentsDto,
            ...remaining
        };
    }

    async delete(projectId: number, auditEntry: AudityEntryDto): Promise<boolean> {

        let dbProject = await this.findOne(projectId);

        if (!dbProject) {
            throw new NotFoundException(
                await I18nContext.current().translate('project.NOT_FOUND', {
                    args: { id: projectId },
                })
            );
        }

        dbProject.active = false;
        dbProject = await this.projectRepository.save(dbProject);

        if (auditEntry) {
            auditEntry.actionType = 'DELETE';
            auditEntry.targetEntity = this.projectRepository.metadata.targetName;
            auditEntry.targetTable = this.projectRepository.metadata.tableName;
            auditEntry.targetEntityId = dbProject.id;
            auditEntry.targetEntityBody = '';
            this.auditService.audit(auditEntry);
        }

        return dbProject.active === false;
    }

    async activate(projectId: number, auditEntry: AudityEntryDto): Promise<boolean> {

        let dbProject = await this.findOne(projectId);

        if (!dbProject) {
            throw new NotFoundException(
                await I18nContext.current().translate('project.NOT_FOUND', {
                    args: { id: projectId },
                })
            );
        }

        dbProject.active = true;
        dbProject = await this.projectRepository.save(dbProject);

        if (auditEntry) {
            auditEntry.actionType = 'ACTIVATE';
            auditEntry.targetEntity = this.projectRepository.metadata.targetName;
            auditEntry.targetTable = this.projectRepository.metadata.tableName;
            auditEntry.targetEntityId = dbProject.id;
            auditEntry.targetEntityBody = '';
            this.auditService.audit(auditEntry);
        }

        return dbProject.active === true;
    }

    async addProjectMemberFromPayrolls(collaborator: Collaborator): Promise<boolean> {

        //  TODO:  error handling
        for (const pr of collaborator.payroll) {

            const dbProject = await this.projectRepository.findOne(
                {
                    where: { id: pr.project.id },
                    relations: ['projectMembers']
                });

            if (dbProject) {

                let pmChanges = false;
                const pm: ProjectMember = dbProject.projectMembers.find(pm => pm.collaborator.id === collaborator.id);
                if (!pm) {
                    const npm = new ProjectMember();
                    npm.active = true;
                    npm.collaborator = collaborator;
                    npm.jobTitle = pr.jobTitle;

                    dbProject.projectMembers.push(npm);
                    pmChanges = true;
                }

                if(pmChanges){
                    await this.projectRepository.save(dbProject);
                    this.calculateProjectFinanceGrids(dbProject);
                }
            }
        }

        return true;
    }

    async addProjectMember(createProjecyMemberDto: CreateProjectMemberDto): Promise<boolean> {

        const dbProject = await this.projectRepository.findOne(
            { where: {
                id: createProjecyMemberDto.project
            },
                relations: ['projectMembers']
            });

        if (dbProject) {

            const pm: ProjectMember = dbProject.projectMembers.find(pm => pm.collaborator.id == createProjecyMemberDto.collaborator);
            if (!pm) {
                const npm = new ProjectMember();
                npm.active = true;
                npm.collaborator = new Collaborator();
                npm.collaborator.id = createProjecyMemberDto.collaborator;
                npm.jobTitle = createProjecyMemberDto.jobTitle;

                dbProject.projectMembers.push(npm);
            }

            await this.projectRepository.save(dbProject);

            return true;
        }

        return false;
    }

    round(input: number, decimalLimit = 2): number {
        try {
            const c = input.toFixed(decimalLimit);
            return parseFloat(c);
        } catch (e) {
            return input;
        }
    }

}
