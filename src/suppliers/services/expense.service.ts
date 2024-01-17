/* eslint-disable @typescript-eslint/no-unused-vars */
import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { classToPlain } from 'class-transformer';
import * as filesize from "filesize";
import * as moment from 'moment';
import { I18nContext } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { AudityEntryDto } from '../../audit/interface/audit-entry.dto';
import { AuditService } from '../../audit/service/audit.service';
import { PaymentDto } from '../../collaborators/interfaces/payment.dto';
import { PayrollService } from '../../collaborators/services/payroll.service';
import { DocumentTypeDto } from '../../documents/interfaces/document-type.dto';
import { DocumentDto } from '../../documents/interfaces/document.dto';
import { FileTypeDto } from '../../documents/interfaces/file-type.dto';
import { DocumentsService } from '../../documents/services/documents.service';
import { FileManagementService } from '../../filemanagement/services/filemanagement.service';
import { Project } from '../../projects/entity/project.entity';
import { ProjectDto } from '../../projects/interfaces/project.dto';
import { ProjectsService } from '../../projects/services/projects.service';
import { BudgetCategory } from '../entity/budget-category.entity';
import { CostShare } from '../entity/cost-sharing.entity';
import { ExpenseInstallment } from '../entity/expense-installment.entity';
import { Expense } from '../entity/expense.entity';
import { Supplier } from '../entity/supplier.entity';
import { TripExpenseDetails } from '../entity/trip-expense-details.entity';
import { ExpenseStatusEnum } from '../enums/expense-status.enum';
import { AddExpenseDocumentDto } from '../interfaces/add-expense-document.dto';
import { BudgetCategoryDto } from '../interfaces/budget-category.dto';
import { CostShareDto } from '../interfaces/cost-share.dto';
import { CreateExpenseDto } from '../interfaces/create-expense.dto';
import { ExpenseInstallmentDto } from '../interfaces/expense-installment.dto';
import { ExpenseDto } from '../interfaces/expense.dto';
import { SupplierDto } from '../interfaces/supplier.dto';
import { TripExpenseDetailsDto } from '../interfaces/trip-expense-details.dto';

@Injectable()
export class ExpenseService {

    constructor(
        @Inject('EXPENSES_REPOSITORY')
        private expensesRepository: Repository<Expense>,
        // private readonly budgetCategoryService: BudgetCategoryService,
        private readonly documentsService: DocumentsService,
        private readonly fileManagementService: FileManagementService,
        @Inject(forwardRef(() => PayrollService))
        private readonly payrollService: PayrollService,
        private readonly auditService: AuditService,
        @Inject(forwardRef(() => ProjectsService))
        private readonly projectService: ProjectsService,
    ) { }

    async findOne(expenseId: number): Promise<Expense> {
        return this.expensesRepository.findOne({where: { id: expenseId}});
    }

    async create(dto: CreateExpenseDto, auditEntry: AudityEntryDto): Promise<ExpenseDto> {

        const projectIds = new Set<number>();

        const dbEntity = new Expense();
        dbEntity.active = true;
        dbEntity.supplier = dto.supplierId ? new Supplier(dto.supplierId) : null;
        dbEntity.budgetCategory = new BudgetCategory(dto.budgetCategoryId);
        dbEntity.requestDate = moment(dto.requestDate, 'YYYY-MM-DD').toDate();
        dbEntity.description = dto.description;
        dbEntity.value = dto.value;
        dbEntity.status = dto.status ?? ExpenseStatusEnum.PLANNED;

        if (dto.dueDate) {
            dbEntity.dueDate = moment(dto.dueDate, 'YYYY-MM-DD').toDate();
        }
        if (dto.paymentDate) {
            dbEntity.paymentDate = moment(dto.paymentDate, 'YYYY-MM-DD').toDate();
        }
        if (dto.deliveryDate) {
            dbEntity.deliveryDate = moment(dto.deliveryDate, 'YYYY-MM-DD').toDate();
        }

        dbEntity.documents = [];
        if (dto.documents && dto.documents.length > 0) {
            dbEntity.documents = await this.documentsService.findByIds(dto.documents);
        }

        if (dto.costShare) {
            dbEntity.costShare = dto.costShare.map(cs => {
                projectIds.add(+cs.projectId);

                const _cs = new CostShare();
                _cs.project = new Project(cs.projectId);
                _cs.value = cs.value;
                return _cs;
            });
        }

        if (dto.installments) {
            dbEntity.installments = dto.installments.map(i => {

                const _i = new ExpenseInstallment();
                _i.order = i.order;
                _i.description = i.description;
                _i.paymentDate = i.paymentDate;
                _i.month = i.month;
                _i.year = i.year;
                _i.value = i.value;
                _i.isPaid = i.isPaid;
                _i.project = new Project();
                _i.project.id = +i.project.id;
                return _i;
            });
        }

        if (dto.tripDetails) {
            const tripDetails = new TripExpenseDetails();
            tripDetails.passengerName = dto.tripDetails.passengerName;
            tripDetails.passengerCpf = dto.tripDetails.passengerCpf;
            tripDetails.hostingValue = dto.tripDetails.hostingValue;
            tripDetails.ticketValue = dto.tripDetails.ticketValue;
            tripDetails.dailyAllowanceValue = dto.tripDetails.dailyAllowanceValue;

            dbEntity.tripDetails = tripDetails;
        }

        this.expensesRepository.create(dbEntity);
        await this.expensesRepository.save(dbEntity);

        let refreshEntityDocs = false;
        for (const doc of dbEntity.documents) {

            if (doc.url.includes("_CAPTIA_TEMP_SUPPLIER_ID_") && doc.url.includes("_CAPTIA_TEMP_EXPENSE_ID_")) {
                refreshEntityDocs = true;
                let newPath = doc.url;
                newPath = newPath.replace(/_CAPTIA_TEMP_SUPPLIER_ID_/g, dbEntity.supplier.id.toString());
                newPath = newPath.replace(/_CAPTIA_TEMP_EXPENSE_ID_/g, dbEntity.id.toString());
                await this.fileManagementService.moveFileFromTempPath(doc.url, newPath);
                doc.url = newPath;
            }
        }

        if (refreshEntityDocs) {
            await this.expensesRepository.save(dbEntity);
        }

        const _dbEntity = await this.expensesRepository.findOne({
            where: { id: dbEntity.id },
            relations: ['budgetCategory', 'supplier', 'costShare', 'documents', 'installments']
        });

        // const { documents, dependents, benefits, payRoll, ...remaining } = createSupplierDto;

        if (auditEntry) {
            auditEntry.actionType = 'CREATE';
            auditEntry.targetEntity = this.expensesRepository.metadata.targetName;
            auditEntry.targetTable = this.expensesRepository.metadata.tableName;
            auditEntry.targetEntityId = _dbEntity.id;
            auditEntry.targetEntityBody = JSON.stringify(classToPlain(_dbEntity));
            this.auditService.audit(auditEntry);
        }

        // Update project remaining budget
        projectIds.forEach(async pId => {
            await this.projectService.updateProjectMargin(pId);
        });

        return <ExpenseDto>{
            id: _dbEntity.id,
            description: _dbEntity.description,
            value: _dbEntity.value,
            requestDate: moment(_dbEntity.requestDate).format('YYYY-MM-DD'),
            dueDate: _dbEntity.dueDate ? moment(_dbEntity.dueDate).format('DD/MM/YYYY') : null,
            paymentDate: _dbEntity.paymentDate ? moment(_dbEntity.paymentDate).format('DD/MM/YYYY') : null,
            deliveryDate: _dbEntity.deliveryDate ? moment(_dbEntity.deliveryDate).format('DD/MM/YYYY') : null,
            status: _dbEntity.status,
            supplier: _dbEntity.supplier && _dbEntity.supplier.id ? <SupplierDto>{
                id: _dbEntity.supplier.id,
                name: _dbEntity.supplier.name,
                cnpj: _dbEntity.supplier.cnpj
            } : null,
            budgetCategory: <BudgetCategoryDto>{
                id: _dbEntity.budgetCategory.id,
                code: _dbEntity.budgetCategory.code,
                name: _dbEntity.budgetCategory.name
            },
            documents: _dbEntity.documents.map(dd =>
                <DocumentDto>{
                    id: dd.id,
                    filename: dd.filename,
                    size: filesize.filesize(dd.size),
                    created: moment(dd.created).format('DD/MM/YYYY [às] HH:mm'),
                    url: dd.url,
                    documentType: dd.documentType && <DocumentTypeDto>{
                        id: dd.documentType.id,
                        name: dd.documentType.name
                    },
                    fileType: dd.fileType && <FileTypeDto>{
                        id: dd.fileType.id,
                        name: dd.fileType.name
                    }
                }
            ),
            tripDetails: _dbEntity.tripDetails && _dbEntity.tripDetails.id ?
                <TripExpenseDetailsDto>{
                    id: _dbEntity.tripDetails.id,
                    passengerName: _dbEntity.tripDetails.passengerName,
                    passengerCpf: _dbEntity.tripDetails.passengerCpf,
                    hostingValue: _dbEntity.tripDetails.hostingValue,
                    ticketValue: _dbEntity.tripDetails.ticketValue,
                    dailyAllowanceValue: _dbEntity.tripDetails.dailyAllowanceValue
                } : null,
            installments: _dbEntity.installments && _dbEntity.installments.sort((i1, i2) => i1.order - i2.order).map(i => <ExpenseInstallmentDto>{
                id: i.id,
                description: i.description,
                paymentDate: i.paymentDate,
                order: i.order,
                month: i.month,
                year: i.year,
                value: i.value,
                isPaid: i.isPaid,
                project: <ProjectDto> {
                    id: i.project.id,
                    name: i.project.name
                }
            })
        };
    }

    async addDocument(dto: AddExpenseDocumentDto, auditEntry: AudityEntryDto): Promise<DocumentDto> {

        const dbEntity = await this.expensesRepository.findOne({
            where: { id: dto.expenseId },
            relations: ['budgetCategory', 'supplier', 'costShare', 'documents']
        });

        if (dto.documentId) {
            const d = await this.documentsService.findOne(dto.documentId);
            dbEntity.documents.push(d);
        }

        await this.expensesRepository.save(dbEntity);

        let refreshEntityDocs = false;
        for (const doc of dbEntity.documents) {

            if (doc.url.includes("_CAPTIA_TEMP_SUPPLIER_ID_") && doc.url.includes("_CAPTIA_TEMP_EXPENSE_ID_")) {
                refreshEntityDocs = true;
                let newPath = doc.url;
                newPath = newPath.replace(/_CAPTIA_TEMP_SUPPLIER_ID_/g, dbEntity.supplier.id.toString());
                newPath = newPath.replace(/_CAPTIA_TEMP_EXPENSE_ID_/g, dbEntity.id.toString());
                await this.fileManagementService.moveFileFromTempPath(doc.url, newPath);
                doc.url = newPath;
            }
        }

        if (refreshEntityDocs) {
            await this.expensesRepository.save(dbEntity);
        }

        const _dbEntity = await this.expensesRepository.findOne({
            where: { id: dbEntity.id },
            relations: ['documents']
        });

        if (auditEntry) {
            auditEntry.actionType = 'EDIT';
            auditEntry.targetEntity = this.expensesRepository.metadata.targetName;
            auditEntry.targetTable = this.expensesRepository.metadata.tableName;
            auditEntry.targetEntityId = _dbEntity.id;
            auditEntry.targetEntityBody = JSON.stringify(classToPlain(_dbEntity));
            this.auditService.audit(auditEntry);
        }

        const dd = await this.documentsService.findOne(dto.documentId);
        return <DocumentDto>{
            id: dd.id,
            filename: dd.filename,
            size: filesize.filesize(dd.size),
            created: moment(dd.created).format('DD/MM/YYYY [às] HH:mm'),
            url: dd.url,
            documentType: dd.documentType && <DocumentTypeDto>{
                id: dd.documentType.id,
                name: dd.documentType.name
            },
            fileType: dd.fileType && <FileTypeDto>{
                id: dd.fileType.id,
                name: dd.fileType.name
            }
        };
    }

    async update(dto: ExpenseDto, auditEntry: AudityEntryDto): Promise<ExpenseDto> {

        const projectIds = new Set<number>();

        try {

            const dbEntity = await this.expensesRepository.findOne({
                where: { id: +dto.id },
                relations: ['budgetCategory', 'supplier', 'costShare', 'documents']
            });
            if (!dbEntity) {
                throw new NotFoundException(
                    await I18nContext.current().translate('expense.NOT_FOUND', {
                        args: { id: dto.id },
                    }),
                );
            }

            dbEntity.active = true;
            dbEntity.supplier = dto.supplier ? new Supplier(dto.supplier.id) : null;
            dbEntity.budgetCategory = new BudgetCategory(dto.budgetCategory.id);
            dbEntity.requestDate = moment(dto.requestDate, 'YYYY-MM-DD').toDate();
            dbEntity.description = dto.description;
            dbEntity.value = dto.value;
            dbEntity.status = dto.status ?? ExpenseStatusEnum.PLANNED;

            if (dto.dueDate) {
                dbEntity.dueDate = moment(dto.dueDate, 'YYYY-MM-DD').toDate();
            }
            if (dto.paymentDate) {
                dbEntity.paymentDate = moment(dto.paymentDate, 'YYYY-MM-DD').toDate();
            }
            if (dto.deliveryDate) {
                dbEntity.deliveryDate = moment(dto.deliveryDate, 'YYYY-MM-DD').toDate();
            }

            dbEntity.documents = [];
            if (dto.documents && dto.documents.length > 0) {
                dbEntity.documents = await this.documentsService.findByIds(dto.documents.map(d => d.id));
            }

            if (dto.costShare) {
                dbEntity.costShare = dto.costShare.map(cs => {
                    projectIds.add(+cs.project.id);
                    let _cs = dbEntity.costShare.find(ecs => ecs.project.id == cs.project.id);
                    if (_cs) {
                        _cs.value = cs.value;
                    } else {
                        _cs = new CostShare();
                        _cs.expense = new Expense(dbEntity.id);
                        _cs.project = new Project(cs.project.id);
                        _cs.value = cs.value;
                    }
                    return _cs;
                });
            }

            if (dto.installments) {
                dbEntity.installments = dto.installments.map(i => {
                    const _i = new ExpenseInstallment();
                    _i.order = i.order;
                    _i.description = i.description;
                    _i.paymentDate = i.paymentDate;
                    _i.month = i.month;
                    _i.year = i.year;
                    _i.value = i.value;
                    _i.isPaid = i.isPaid;
                    _i.project = new Project();
                    _i.project.id = i.project.id;
                    return _i;
                });
            }

            if (dto.tripDetails) {
                const tripDetails = new TripExpenseDetails();
                tripDetails.passengerName = dto.tripDetails.passengerName;
                tripDetails.passengerCpf = dto.tripDetails.passengerCpf;
                tripDetails.hostingValue = dto.tripDetails.hostingValue;
                tripDetails.ticketValue = dto.tripDetails.ticketValue;
                tripDetails.dailyAllowanceValue = dto.tripDetails.dailyAllowanceValue;

                dbEntity.tripDetails = tripDetails;
            }

            await this.expensesRepository.save(dbEntity);

            let refreshEntityDocs = false;
            for (const doc of dbEntity.documents) {

                if (doc.url.includes("_CAPTIA_TEMP_SUPPLIER_ID_") && doc.url.includes("_CAPTIA_TEMP_EXPENSE_ID_")) {
                    refreshEntityDocs = true;
                    let newPath = doc.url;
                    newPath = newPath.replace(/_CAPTIA_TEMP_SUPPLIER_ID_/g, dbEntity.supplier.id.toString());
                    newPath = newPath.replace(/_CAPTIA_TEMP_EXPENSE_ID_/g, dbEntity.id.toString());
                    await this.fileManagementService.moveFileFromTempPath(doc.url, newPath);
                    doc.url = newPath;
                }
            }

            if (refreshEntityDocs) {
                await this.expensesRepository.save(dbEntity);
            }

            const _dbEntity = await this.expensesRepository.findOne({
                where: { id: dbEntity.id },
                relations: ['budgetCategory', 'supplier', 'costShare', 'documents', 'installments']
            });

            if (auditEntry) {
                auditEntry.actionType = 'UPDATE';
                auditEntry.targetEntity = this.expensesRepository.metadata.targetName;
                auditEntry.targetTable = this.expensesRepository.metadata.tableName;
                auditEntry.targetEntityId = _dbEntity.id;
                auditEntry.targetEntityBody = JSON.stringify(classToPlain(_dbEntity));
                this.auditService.audit(auditEntry);
            }

            // Update project remaining budget
            projectIds.forEach(async pId => {
                await this.projectService.updateProjectMargin(pId);
            });

            return <ExpenseDto>{
                id: _dbEntity.id,
                description: _dbEntity.description,
                value: _dbEntity.value,
                requestDate: moment(_dbEntity.requestDate).format('YYYY-MM-DD'),
                dueDate: _dbEntity.dueDate ? moment(_dbEntity.dueDate).format('DD/MM/YYYY') : null,
                paymentDate: _dbEntity.paymentDate ? moment(_dbEntity.paymentDate).format('DD/MM/YYYY') : null,
                deliveryDate: _dbEntity.deliveryDate ? moment(_dbEntity.deliveryDate).format('DD/MM/YYYY') : null,
                status: _dbEntity.status,
                supplier: _dbEntity.supplier && _dbEntity.supplier.id ? <SupplierDto>{
                    id: _dbEntity.supplier.id,
                    name: _dbEntity.supplier.name,
                    cnpj: _dbEntity.supplier.cnpj
                } : null,
                budgetCategory: <BudgetCategoryDto>{
                    id: _dbEntity.budgetCategory.id,
                    code: _dbEntity.budgetCategory.code,
                    name: _dbEntity.budgetCategory.name
                },
                documents: _dbEntity.documents.map(dd =>
                    <DocumentDto>{
                        id: dd.id,
                        filename: dd.filename,
                        size: filesize.filesize(dd.size),
                        created: moment(dd.created).format('DD/MM/YYYY [às] HH:mm'),
                        url: dd.url,
                        documentType: dd.documentType && <DocumentTypeDto>{
                            id: dd.documentType.id,
                            name: dd.documentType.name
                        },
                        fileType: dd.fileType && <FileTypeDto>{
                            id: dd.fileType.id,
                            name: dd.fileType.name
                        }
                    }
                ),
                tripDetails: _dbEntity.tripDetails && _dbEntity.tripDetails.id ?
                    <TripExpenseDetailsDto>{
                        id: _dbEntity.tripDetails.id,
                        passengerName: _dbEntity.tripDetails.passengerName,
                        passengerCpf: _dbEntity.tripDetails.passengerCpf,
                        hostingValue: _dbEntity.tripDetails.hostingValue,
                        ticketValue: _dbEntity.tripDetails.ticketValue,
                        dailyAllowanceValue: _dbEntity.tripDetails.dailyAllowanceValue
                    } : null,
                installments: _dbEntity.installments && _dbEntity.installments.sort((i1, i2) => i1.order - i2.order).map(i => <ExpenseInstallmentDto>{
                    id: i.id,
                    description: i.description,
                    paymentDate: i.paymentDate,
                    order: i.order,
                    month: i.month,
                    year: i.year,
                    value: i.value,
                    isPaid: i.isPaid,
                    project: <ProjectDto>{
                        id: i.project.id,
                        name: i.project.name
                    }
                })
            };
        } catch (error) {
            console.log(error);
        }
    }

    async get(expenseId: number, i18n: I18nContext, auditEntry?: AudityEntryDto): Promise<ExpenseDto> {

        const dbExpense = await this.expensesRepository.findOne(
            { where: { id: expenseId}, relations: ['budgetCategory', 'supplier', 'costShare', 'costShare.project', 'documents', 'tripDetails', 'installments'] });

        if (!dbExpense) {
            throw new NotFoundException(
                await i18n.translate('expense.NOT_FOUND', {
                    args: { id: expenseId },
                })
            );
        }

        const expenseDto = <ExpenseDto>{
            id: dbExpense.id,
            requestDate: moment(dbExpense.requestDate).format('DD/MM/YYYY'),
            dueDate: dbExpense.dueDate ? moment(dbExpense.dueDate).format('DD/MM/YYYY') : null,
            paymentDate: dbExpense.paymentDate ? moment(dbExpense.paymentDate).format('DD/MM/YYYY') : null,
            deliveryDate: dbExpense.deliveryDate ? moment(dbExpense.deliveryDate).format('DD/MM/YYYY') : null,
            value: dbExpense.value,
            status: dbExpense.status,
            supplier: dbExpense.supplier && dbExpense.supplier.id ? <SupplierDto>{
                id: dbExpense.supplier.id,
                name: dbExpense.supplier.name,
                cnpj: dbExpense.supplier.cnpj
            } : null,
            budgetCategory: {
                id: dbExpense.budgetCategory.id,
                name: dbExpense.budgetCategory.name
            },
            costShare: dbExpense.costShare ? dbExpense.costShare.map(cs => <CostShareDto>{
                id: cs.id,
                value: cs.value,
                project: {
                    id: cs.project.id,
                    name: cs.project.name
                }
            }) : [],
            documents: dbExpense.documents && dbExpense.documents.map(dd => <DocumentDto>{
                id: dd.id,
                filename: dd.filename,
                size: filesize.filesize(dd.size),
                created: moment(dd.created).format('DD/MM/YYYY [às] HH:mm'),
                url: dd.url,
                documentType: dd.documentType && <DocumentTypeDto>{
                    id: dd.documentType.id,
                    name: dd.documentType.name
                },
                fileType: dd.fileType && <FileTypeDto>{
                    id: dd.fileType.id,
                    name: dd.fileType.name
                }
            }),
            tripDetails: dbExpense.tripDetails && dbExpense.tripDetails.id ?
                <TripExpenseDetailsDto>{
                    id: dbExpense.tripDetails.id,
                    passengerName: dbExpense.tripDetails.passengerName,
                    passengerCpf: dbExpense.tripDetails.passengerCpf,
                    hostingValue: dbExpense.tripDetails.hostingValue,
                    ticketValue: dbExpense.tripDetails.ticketValue,
                    dailyAllowanceValue: dbExpense.tripDetails.dailyAllowanceValue
                } : {},
            installments: dbExpense.installments && dbExpense.installments.sort((i1, i2) => i1.order - i2.order).map(i => <ExpenseInstallmentDto>{
                id: i.id,
                description: i.description,
                paymentDate: i.paymentDate,
                order: i.order,
                month: i.month,
                year: i.year,
                value: i.value,
                isPaid: i.isPaid,
                project: <ProjectDto> {
                    id: i.project.id,
                    name: i.project.name
                }
            })
        };

        return expenseDto;

    }

    private convertEntityToDto(dbEntity: Expense): ExpenseDto {
        return <ExpenseDto> {
            id: dbEntity.id,
            requestDate: moment(dbEntity.requestDate).format('DD/MM/YYYY'),
            dueDate: dbEntity.dueDate ? moment(dbEntity.dueDate).format('DD/MM/YYYY') : '',
            paymentDate: dbEntity.paymentDate ? moment(dbEntity.paymentDate).format('DD/MM/YYYY') : '',
            deliveryDate: dbEntity.deliveryDate ? moment(dbEntity.deliveryDate).format('DD/MM/YYYY') : '',
            description: dbEntity.description,
            supplier: dbEntity.supplier ? <SupplierDto>{
                id: dbEntity.supplier.id,
                name: dbEntity.supplier.name,
                companyName: dbEntity.supplier.companyName,
                cnpj: dbEntity.supplier.cnpj
            } : null,
            value: dbEntity.value,
            status: dbEntity.status,
            budgetCategory: {
                id: dbEntity.budgetCategory.id,
                code: dbEntity.budgetCategory.code,
                name: dbEntity.budgetCategory.name
            },
            costShare: dbEntity.costShare ? dbEntity.costShare.map(cs => <CostShareDto>{
                id: cs.id,
                value: cs.value,
                project: {
                    id: cs.project.id,
                    name: cs.project.name
                }
            }) : [],
            documents: dbEntity.documents && dbEntity.documents.map(dd => <DocumentDto>{
                id: dd.id,
                filename: dd.filename,
                size: filesize.filesize(dd.size),
                created: moment(dd.created).format('DD/MM/YYYY [às] HH:mm'),
                url: dd.url,
                documentType: dd.documentType && <DocumentTypeDto>{
                    id: dd.documentType.id,
                    name: dd.documentType.name
                },
                fileType: dd.fileType && <FileTypeDto>{
                    id: dd.fileType.id,
                    name: dd.fileType.name
                }
            }),
            installments: dbEntity.installments && dbEntity.installments.            
                sort((i1, i2) => i1.order - i2.order).map(i => <ExpenseInstallmentDto>{
                id: i.id,
                description: i.description,
                paymentDate: i.paymentDate,
                order: i.order,
                month: i.month,
                year: i.year,
                value: i.value,
                isPaid: i.isPaid,
                project: <ProjectDto> {
                    id: i.project.id,
                    name: i.project.name
                }
            })
        };
    }

    async getExpensesByProject(projectId: number, orderby = 'requestDate', desc = false, expenseStatus: string, payments?: PaymentDto[], i18n?: I18nContext, auditEntry?: AudityEntryDto): Promise<ExpenseDto[]> {

        // const dbExpenses = await this.expensesRepository.find({
        //     relations: ['budgetCategory', 'supplier', 'costShare', 'documents', 'tripDetails', 'installments'],            
        //     join: { alias: 'expenses', innerJoin: { installments: 'expenses.installments' } },
        //     where: qb => {
        //         qb.andWhere('installments.project IN (:_projectId)', { _projectId: projectId });
        //         qb.andWhere('expenses.active = true');
        //         if(expenseStatus){
        //             if(expenseStatus.length > 0 && expenseStatus != 'undefined'){
        //                 qb.andWhere('expenses.status ilike :status', { status: expenseStatus});
        //             }
        //         }
        //     },
        //     order: {
        //         [orderby]: desc ? "DESC" : "ASC"
        //     }
        // });

        const _r = this.expensesRepository
          .createQueryBuilder('expense')
          .innerJoinAndSelect('expense.budgetCategory', 'budgetCategory')
          .leftJoinAndSelect('expense.supplier', 'supplier')
          .leftJoinAndSelect('expense.costShare', 'costShare')
          .leftJoinAndSelect('costShare.project', 'csproject')
          .leftJoinAndSelect('expense.documents', 'documents')
          .leftJoinAndSelect('documents.fileType', 'fileType')
          .leftJoinAndSelect('documents.documentType', 'documentType')
          .leftJoinAndSelect('expense.tripDetails', 'tripDetails')
          .leftJoinAndSelect('expense.installments', 'installments')
          .leftJoinAndSelect('installments.project', 'stproject')
          .where('installments.project = :projectId', { projectId })
          .andWhere('expense.active = :active', { active: true });

          if(expenseStatus && expenseStatus.length > 0 && expenseStatus != 'undefined'){
            _r.andWhere('expense.status ilike :status', { status: expenseStatus });
          }

      const dbExpenses = await _r.getMany();

        if (!dbExpenses) {
            throw new NotFoundException(
                await i18n.translate('expense.NOT_FOUND', {
                    args: { id: projectId },
                })
            );
        }

        const expenseDtos = dbExpenses.map(elem => this.convertEntityToDto(elem));

        // // Collecting HR Expenses
        if(!payments){
            payments = await this.payrollService.getPaymentsByProject(projectId, true);
        }
        if(expenseStatus && expenseStatus.length > 0 && expenseStatus != 'undefined'){
            payments = payments.filter(p => p.paid == 
                (['Realizado','Andamento'].includes(expenseStatus) ? true : false));
        }

        const hrBudgetCategories = new Map<number, BudgetCategoryDto>();
        payments.forEach(p => hrBudgetCategories.set(p.budgetCategory.id, p.budgetCategory));
        
        
        const hrExpensesPerMonth = new Map<string, number>();
        for (const p of payments) {
            const currentMonthValue = hrExpensesPerMonth.get(`${p.budgetCategory.id}__${p.month}/${p.year}`);            
            if(!currentMonthValue){
                hrExpensesPerMonth.set(`${p.budgetCategory.id}__${p.month}/${p.year}`, p.totalValue);
            } else {
                hrExpensesPerMonth.set(`${p.budgetCategory.id}__${p.month}/${p.year}`, currentMonthValue + p.totalValue);
            }
        }
        
        const paymentDay = 25;
        const hrExpenses:ExpenseDto[] = [];
        for (const [_period, value] of hrExpensesPerMonth.entries()) {
            const [_budgetCategory, period] = _period.split('__');
            const [month, year] = period.split('/');
            const budgetCategory = hrBudgetCategories.get(+_budgetCategory);
            const collaborators = new Set<string>();
            payments
                .filter(p => `${p.month}/${p.year}` == period && p.budgetCategory.id == +_budgetCategory)
                .map(p => p.collaboratorInfo)
                .forEach(ci => collaborators.add(ci));
            const collaboratorsStrList = Array.from(collaborators).join('\n');
            hrExpenses.push(<ExpenseDto>{
                    id: null,
                    budgetCategory: budgetCategory,
                    description: `${collaboratorsStrList}`,
                    value: value,
                    requestDate: `${paymentDay}/${period}`,
                    dueDate: `${paymentDay}/${period}`,
                    isHrExpense: true,
                    installments: [
                        <ExpenseInstallmentDto> {
                            project: <ProjectDto> { id: projectId },
                            paymentDate: moment(`${paymentDay}/${period}`,'DD/MM/YYYY').toDate(),
                            month: +month,
                            year: +year,
                            value: value
                        }
                    ]
                }
            );
        }
        expenseDtos.push(...hrExpenses);
       
        expenseDtos.sort((e1, e2) => e1.requestDate && e2.requestDate ? moment(e1.requestDate, 'DD/MM/YYYY').diff(moment(e2.requestDate, 'DD/MM/YYYY')) : 0);

        return expenseDtos;

    }

    async getTotalExpensesByProject(projectId: number, i18n?: I18nContext, auditEntry?: AudityEntryDto): Promise<number> {

        const dbExpenses = await this.expensesRepository.find({
            relations: ['installments'],            
            join: { alias: 'expenses', innerJoin: { installments: 'expenses.installments' } },
            // TODO: update pending
            // where: qb => {
            //     qb.andWhere('installments.project IN (:_projectId)', { _projectId: projectId });
            //     qb.andWhere('expenses.active = true');                
            // }
        });

        if (!dbExpenses) {
            throw new NotFoundException(
                await i18n.translate('expense.NOT_FOUND', {
                    args: { id: projectId },
                })
            );
        }

        // Collecting General Expenses
        const directExpensesTotal = dbExpenses.reduce(
            (expSum, exp) => expSum + exp.installments.filter(i => +i.project.id == projectId).reduce(
                (instSum, inst) => instSum + inst.value, 0), 0);

        // Collecting HR Expenses
        const payments = await this.payrollService.getPaymentsByProject(projectId, true);
        const hrExpensesTotal = payments.reduce((hrSum, pay) => hrSum + pay.totalValue, 0);           
        
        return directExpensesTotal + hrExpensesTotal;
    }

    async getHrPaymentsByProject(projectId: number, payments?: PaymentDto[],  i18n?: I18nContext, auditEntry?: AudityEntryDto): Promise<PaymentDto[]> {
       
        // Collecting HR Expenses
        if(!payments){
            payments = await this.payrollService.getPaymentsByProject(projectId, true);        
        }
        // return payments.sort((e1, e2) => moment(`25/${e1.month}/${e1.year}`, 'DD/MM/YYYY').diff(moment(`25/${e2.month}/${e2.year}`, 'DD/MM/YYYY')));
        return payments.sort((e1, e2) => {
            if(+e1.year == +e2.year && +e1.month == +e2.month) return 0;
            else if(+e1.year == +e2.year && +e1.month < +e2.month) return -1;
            else if(+e1.year == +e2.year && +e1.month > +e2.month) return 1;
            else if(+e1.year < +e2.year) return -1
            else return 1;
        });

    }

    async delete(expenseId: number, i18n: I18nContext, auditEntry: AudityEntryDto): Promise<boolean> {

        let dbEntity = await this.findOne(expenseId);

        if (!dbEntity) {
            throw new NotFoundException(
                await i18n.translate('expense.NOT_FOUND', {
                    args: { id: expenseId },
                })
            );
        }

        dbEntity.active = false;
        dbEntity = await this.expensesRepository.save(dbEntity);

        if (auditEntry) {
            auditEntry.actionType = 'DELETE';
            auditEntry.targetEntity = this.expensesRepository.metadata.targetName;
            auditEntry.targetTable = this.expensesRepository.metadata.tableName;
            auditEntry.targetEntityId = dbEntity.id;
            auditEntry.targetEntityBody = '';
            this.auditService.audit(auditEntry);
        }

        return dbEntity.active === false;
    }

    async activate(expenseId: number, i18n: I18nContext, auditEntry: AudityEntryDto): Promise<boolean> {

        let dbEntity = await this.findOne(expenseId);

        if (!dbEntity) {
            throw new NotFoundException(
                await i18n.translate('expense.NOT_FOUND', {
                    args: { id: expenseId },
                })
            );
        }

        dbEntity.active = true;
        dbEntity = await this.expensesRepository.save(dbEntity);

        if (auditEntry) {
            auditEntry.actionType = 'ACTIVATE';
            auditEntry.targetEntity = this.expensesRepository.metadata.targetName;
            auditEntry.targetTable = this.expensesRepository.metadata.tableName;
            auditEntry.targetEntityId = dbEntity.id;
            auditEntry.targetEntityBody = '';
            this.auditService.audit(auditEntry);
        }

        return dbEntity.active === true;
    }

    async confirmExpensePayment(expenseId: number, expenseInstallmentId:number, i18n: I18nContext, auditEntry: AudityEntryDto): Promise<ExpenseDto> {

        try{

            const dbEntity = await this.expensesRepository.findOne({where: { id: expenseId }, relations: [ 'installments' ]});
            if (!dbEntity) {
                throw new NotFoundException(
                    await i18n.translate('expense.NOT_FOUND', {
                        args: { id: expenseId },
                    })
                );
            }

            if(dbEntity.installments?.length > 0 && expenseInstallmentId) {
                const installment = dbEntity.installments?.find(i => i.id == expenseInstallmentId);
                if(!installment) {
                    throw new NotFoundException(
                        await i18n.translate('expense.INSTALLMENTS.NOT_FOUND', {
                            args: { id: expenseId },
                        })
                    );
                }    
                installment.isPaid = true;
            }

            const paidInstallments = dbEntity.installments.reduce((count, i) => count + (i.isPaid ? 1 : 0), 0);
            if(dbEntity.installments && (paidInstallments == dbEntity.installments.length)
                || (!dbEntity.installments || dbEntity.installments.length == 0)) {
                dbEntity.status = ExpenseStatusEnum.FINISHED;
            } else if (paidInstallments > 0) {
                dbEntity.status = ExpenseStatusEnum.ONGOING;
            }

            await this.expensesRepository.save(dbEntity);
            return await this.get(expenseId, i18n, auditEntry);
        
        } catch (error) {
            console.error(error);
        }
        
    }

}
