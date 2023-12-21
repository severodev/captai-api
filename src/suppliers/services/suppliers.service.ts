import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { classToPlain } from 'class-transformer';
import * as moment from 'moment';
import { I18nContext } from 'nestjs-i18n';
import { BankService } from './../../projects/services/bank.service';
import { FindManyOptions, Raw, Repository } from 'typeorm';
import { Supplier } from '../entity/supplier.entity';
import { CostShareDto } from '../interfaces/cost-share.dto';
import { CreateSupplierDto } from '../interfaces/create-supplier.dto';
import { ExpenseDto } from '../interfaces/expense.dto';
import { SupplierCardDto } from '../interfaces/supplier-card.dto';
import { SupplierDropdownDto } from '../interfaces/supplier-dropdown.dto';
import { SupplierDto } from '../interfaces/supplier.dto';
import { UpdateSupplierDto } from '../interfaces/update-supplier.dto';
import { AudityEntryDto } from './../../audit/interface/audit-entry.dto';
import { AuditService } from './../../audit/service/audit.service';
import { LocationService } from './../../location/service/location.service';
import { PaginationMetadataDto } from './../../util/interfaces/pagination-metadata.dto';
import { BudgetCategoryService } from './budgetCategory.service';

@Injectable()
export class SuppliersService {

    constructor(
        @Inject('SUPPLIERS_REPOSITORY')
        private suppliersRepository: Repository<Supplier>,
        private readonly locationService: LocationService,
        private readonly budgetCategoryService: BudgetCategoryService,
        // private readonly documentsService: DocumentsService,
        // private readonly fileManagementService: FileManagementService,
        private readonly bankService: BankService,
        private readonly auditService: AuditService
    ) { }


    async pagination(search: string, itemsPerPage: number = 10, isActive: boolean): Promise<PaginationMetadataDto> {
        const filters: FindManyOptions<Supplier> = {
            where: {
                active: isActive
            }
        };
        if (search && search.length > 0) {
            const nameFilters = search.split(' ').map(s => { return { name: Raw(alias => `${alias} ilike '%${s}%'`) }; });
            filters.where = nameFilters;
        }

        const totalItems = await this.suppliersRepository.count({ ...filters });
        const paginationMetadata: PaginationMetadataDto = {
            totalItems,
            itemsPerPage: +itemsPerPage, // weird stuff here, always returning string
            totalPages: Math.ceil(totalItems / itemsPerPage)
        }

        return paginationMetadata;
    }

    async filteredCards(stringSearch: string, orderby: string, desc: boolean,
        itemsPerPage: number, page: number, isActive: boolean): Promise<SupplierCardDto[]> {

        const filters: FindManyOptions<Supplier> = {
            take: itemsPerPage,
            skip: (page > 0 ? page - 1 : 0) * itemsPerPage,
            where: {
                active: isActive
            }
        };
        if (stringSearch && stringSearch.length > 0) {
            const nameFilters = stringSearch.split(' ').map(s => { return { name: Raw(alias => `${alias} ilike '%${s}%'`), active: true }; });
            filters.where = nameFilters;
        }
        if (orderby && orderby.length > 0) {
            filters.order = {
                [orderby.includes('d') ? 'created' : 'name']: desc ? "DESC" : "ASC"
            }
        } else {
            filters.order = {
                name: "ASC"
            }
        }

        const result = await this.suppliersRepository.find({ ...filters });
        return result.map(s => <SupplierCardDto>{
            id: s.id,
            name: s.name,
            cnpj: s.cnpj,
            email: s.email,
            website: s.website,
            phoneMain: s.phoneMain,
            phoneSecondary: s.phoneSecondary,
            budgetCategory: s.budgetCategory.name
        });
    }

    //   async csv(search: string, orderby: string, desc: boolean,
    //     itemsPerPage: number, page: number, i18n: I18nContext): Promise<SupplierCSVReport> {

    //     const filters: FindManyOptions<Supplier> = {
    //       take: itemsPerPage,
    //       skip: (page > 0 ? page - 1 : 0) * itemsPerPage,
    //       where: {
    //         active: true
    //       }
    //     };
    //     if (orderby && orderby.length > 0) {
    //       filters.order = {
    //         [orderby.includes('d') ? 'created' : 'name']: desc ? "DESC" : "ASC"
    //       }
    //     } else {
    //       filters.order = {
    //         name: "ASC"
    //       }
    //     }
    //     if (search && search.length > 0) {
    //       const nameFilters = search.split(' ').map(s => { return { name: Raw(alias => `${alias} ilike '%${s}%'`), active: true }; });
    //       filters.where = nameFilters;
    //     }

    //     const result = await this.suppliersRepository.find({ ...filters, relations: ['benefits', 'dependents', 'payroll'] });
    //     const SuppliersList = result.map(c => <SupplierExportDto>{
    //       id: c.id,
    //       name: c.name,
    //       jobTitle: c.jobTitle,
    //       cpf: c.cpf,
    //       rg: c.rg,
    //       rgEmitter: c.rgEmitter,
    //       pis: c.pis,
    //       maritalStatus: c.maritalStatus,
    //       nationality: c.nationality,
    //       birthDate: moment(c.birthDate).format('DD/MM/YYYY'),
    //       email: c.email,
    //       phone: c.phone,
    //       address: c.address,
    //       neighbourhood: c.neighbourhood,
    //       postalCode: c.postalCode,
    //       stateStr: c.stateStr,
    //       cityStr: c.cityStr,
    //       dependents: c.dependents ? c.dependents.length : 0,
    //       benefits: c.benefits ? c.benefits.reduce((lista, b) => {
    //         return `${lista}${lista && lista.length > 0 ? ', ' : ''}${b.name}`;
    //       }, '') : '',
    //       // payRoll: ''
    //     });

    //     // TODO: Bring this from the i18n file
    //     const csvHeaders = [
    //       "ID",
    //       "Nome Completo",
    //       "Cargo",
    //       "CPF",
    //       "RG",
    //       "Emissor RG",
    //       "PIS",
    //       "Estado Civil",
    //       "Nacionalidade",
    //       "Data de Nascimento",
    //       "E-mail",
    //       "Telefone",
    //       "Endereço",
    //       "Bairro",
    //       "CEP",
    //       "Estado",
    //       "Cidade",
    //       "Dependentes",
    //       "Beneficios"
    //     ];

    //     const options = {
    //       fieldSeparator: ';',
    //       quoteStrings: '"',
    //       decimalSeparator: ',',
    //       showLabels: true,
    //       useTextFile: false,
    //       useBom: true,
    //       // useKeysAsHeaders: true,
    //       headers: csvHeaders
    //     };

    //     const csvExporter = new ExportToCsv(options);
    //     const reportContent = csvExporter.generateCsv(SuppliersList, true);

    //     const filename = moment().format('YYYYMMDDHHmmss_') +
    //       await i18n.translate('Supplier.REPORTS.GENERAL.FILENAME')
    //       + '.csv';

    //     return <SupplierCSVReport>{
    //       filename: filename,
    //       content: reportContent
    //     }
    //   }

    async filteredCompact(stringSearch: string, isActive: boolean): Promise<SupplierDropdownDto[]> {
        const filters: FindManyOptions<Supplier> = {
            order: {
                name: "ASC"
            },
            where: {
                active: isActive
            }
        };
        if (stringSearch && stringSearch.length > 0) {
            const nameFilters = stringSearch.split(' ').map(s => { return { name: Raw(alias => `${alias} ilike '%${s}%'`), active: true }; });
            filters.where = nameFilters;
        }
        return (await this.suppliersRepository.find(filters)).map(s => <SupplierDropdownDto>{
            id: s.id,
            name: s.name,
            cnpj: s.cnpj,
            budgetCategory: s.budgetCategory.name
        });
    }

    async findOne(supplierId: number): Promise<Supplier> {
        return this.suppliersRepository.findOne(supplierId);
    }

    async create(createSupplierDto: CreateSupplierDto, auditEntry: AudityEntryDto): Promise<SupplierCardDto> {

        const newSupplier = new Supplier();
        newSupplier.active = true;
        newSupplier.name = createSupplierDto.name;
        newSupplier.companyName = createSupplierDto.companyName;
        newSupplier.cnpj = createSupplierDto.cnpj?.replace(/[ .-]/g, '');
        newSupplier.email = createSupplierDto.email;
        newSupplier.website = createSupplierDto.website;
        if(createSupplierDto.phoneMain)
            newSupplier.phoneMain = createSupplierDto.phoneMain?.replace(/[ .-]/g, '');
        if(createSupplierDto.phoneSecondary)
            newSupplier.phoneSecondary = createSupplierDto.phoneSecondary?.replace(/[ .-]/g, '');
        newSupplier.address = createSupplierDto.address;
        if(createSupplierDto.postalCode)
            newSupplier.postalCode = createSupplierDto.postalCode?.replace(/[ .-]/g, '');

        if (createSupplierDto.bank) {
            newSupplier.bank = await this.bankService.findOne(createSupplierDto.bank);
        }
        newSupplier.bankAgency = createSupplierDto.bankAgency;
        newSupplier.bankAccount = createSupplierDto.bankAccount;
        newSupplier.notes = createSupplierDto.notes;

        if (createSupplierDto.budgetCategory) {
            newSupplier.budgetCategory = await this.budgetCategoryService.findById(createSupplierDto.budgetCategory);
        }

        // TODO: enforce those instead of {city|state}Str temporary options
        if (createSupplierDto.state) {
            newSupplier.state = await this.locationService.findState(createSupplierDto.state);
        }
        if (createSupplierDto.city) {
            newSupplier.city = await this.locationService.findCity(createSupplierDto.city);
        }

        newSupplier.stateStr = createSupplierDto.stateStr;
        newSupplier.cityStr = createSupplierDto.cityStr;
        
        // newSupplier.documents = [];
        // if (createSupplierDto.documents && createSupplierDto.documents.length > 0) {
        //     newSupplier.documents = await this.documentsService.findByIds(createSupplierDto.documents);
        // }

        this.suppliersRepository.create(newSupplier);
        await this.suppliersRepository.save(newSupplier);

        // const { documents, dependents, benefits, payRoll, ...remaining } = createSupplierDto;

        if (auditEntry) {
            auditEntry.actionType = 'CREATE';
            auditEntry.targetEntity = this.suppliersRepository.metadata.targetName;
            auditEntry.targetTable = this.suppliersRepository.metadata.tableName;
            auditEntry.targetEntityId = newSupplier.id;
            auditEntry.targetEntityBody = JSON.stringify(classToPlain(newSupplier));
            this.auditService.audit(auditEntry);
        }
        return <SupplierCardDto>{
            id: newSupplier.id,
            name: newSupplier.name,
            cnpj: newSupplier.cnpj,
            email: newSupplier.email,
            website: newSupplier.website,
            phoneMain: newSupplier.phoneMain,
            phoneSecondary: newSupplier.phoneSecondary,
            budgetCategory: newSupplier.budgetCategory.name
        };
    }

    async update(supplierDto: UpdateSupplierDto, auditEntry: AudityEntryDto): Promise<boolean> {

        const dbInstance = await this.findOne(supplierDto.id);

        dbInstance.name = supplierDto.name;
        dbInstance.companyName = supplierDto.companyName;
        dbInstance.cnpj = supplierDto.cnpj?.replace(/[ .-]/g, '');
        dbInstance.email = supplierDto.email;
        dbInstance.website = supplierDto.website;
        dbInstance.phoneMain = supplierDto.phoneMain?.replace(/[ .-]/g, '');
        dbInstance.phoneSecondary = supplierDto.phoneSecondary?.replace(/[ .-]/g, '');
        dbInstance.address = supplierDto.address;
        dbInstance.postalCode = supplierDto.postalCode?.replace(/[ .-]/g, '');
        dbInstance.notes = supplierDto.notes;

        if (supplierDto.bank) {
            dbInstance.bank = await this.bankService.findOne(supplierDto.bank);
        }
        dbInstance.bankAgency = supplierDto.bankAgency;
        dbInstance.bankAccount = supplierDto.bankAccount;

        if (supplierDto.budgetCategory) {
            dbInstance.budgetCategory = await this.budgetCategoryService.findById(supplierDto.budgetCategory);
        }

        // TODO: enforce those instead of {city|state}Str temporary options
        if (supplierDto.state) {
            dbInstance.state = await this.locationService.findState(supplierDto.state);
        }
        if (supplierDto.city) {
            dbInstance.city = await this.locationService.findCity(supplierDto.city);
        }

        dbInstance.stateStr = supplierDto.stateStr;
        dbInstance.cityStr = supplierDto.cityStr;
        
        // newSupplier.documents = [];
        // if (createSupplierDto.documents && createSupplierDto.documents.length > 0) {
        //     newSupplier.documents = await this.documentsService.findByIds(createSupplierDto.documents);
        // }

        await this.suppliersRepository.save(dbInstance);

        // const { documents, dependents, benefits, payRoll, ...remaining } = createSupplierDto;

        if (auditEntry) {
            auditEntry.actionType = 'UPDATE';
            auditEntry.targetEntity = this.suppliersRepository.metadata.targetName;
            auditEntry.targetTable = this.suppliersRepository.metadata.tableName;
            auditEntry.targetEntityId = dbInstance.id;
            auditEntry.targetEntityBody = JSON.stringify(classToPlain(dbInstance));
            this.auditService.audit(auditEntry);
        }
        return true;
    }

    async get(supplierId: number, i18n: I18nContext, auditEntry: AudityEntryDto): Promise<SupplierDto> {

        let dbSupplier = await this.suppliersRepository.findOne(supplierId, {relations: ['state', 'city', 'bank', 'expenses', 'expenses.costShare', 'expenses.costShare.project', 'expenses.documents']});

        if (!dbSupplier) {
            throw new NotFoundException(
                await i18n.translate('supplier.NOT_FOUND', {
                    args: { id: supplierId },
                })
            );
        }
        
        let supplierDto = <SupplierDto>{
            id: dbSupplier.id,
            name: dbSupplier.name,
            cnpj: dbSupplier.cnpj,
            budgetCategoryId: dbSupplier.budgetCategory.id,
            budgetCategory: dbSupplier.budgetCategory.name,
            email: dbSupplier.email,
            website: dbSupplier.website,
            phoneMain: dbSupplier.phoneMain,
            phoneSecondary: dbSupplier.phoneSecondary,
            address: dbSupplier.address,
            postalCode: dbSupplier.postalCode,
            bank: dbSupplier.bank ? dbSupplier.bank.id : null,
            bankAgency: dbSupplier.bankAgency,
            bankAccount: dbSupplier.bankAccount,
            state: dbSupplier.state ? dbSupplier.state.id : null,
            city: dbSupplier.city ? dbSupplier.city.id : null,
            notes: dbSupplier.notes,
            expenses: dbSupplier.expenses.map(e => <ExpenseDto>{
                id: e.id,
                requestDate: moment(e.requestDate).format('DD/MM/YYYY HH:mm'),
                dueDate: e.dueDate ? moment(e.dueDate).format('DD/MM/YYYY HH:mm') : '',
                value: e.value,
                status: e.status,
                costShare: e.costShare ? e.costShare.map(cs => <CostShareDto>{
                    id: cs.id,
                    value: cs.value,
                    project: {
                       id: cs.project.id,
                       name: cs.project.name
                    }
                }) : []
            })
        };

        return supplierDto;
        
    }

    async delete(projectId: number, i18n: I18nContext, auditEntry: AudityEntryDto): Promise<boolean> {

        let dbColaborator = await this.findOne(projectId);

        if (!dbColaborator) {
            throw new NotFoundException(
                await i18n.translate('supplier.NOT_FOUND', {
                    args: { id: projectId },
                })
            );
        }

        dbColaborator.active = false;
        dbColaborator = await this.suppliersRepository.save(dbColaborator);

        if (auditEntry) {
            auditEntry.actionType = 'DELETE';
            auditEntry.targetEntity = this.suppliersRepository.metadata.targetName;
            auditEntry.targetTable = this.suppliersRepository.metadata.tableName;
            auditEntry.targetEntityId = dbColaborator.id;
            auditEntry.targetEntityBody = '';
            this.auditService.audit(auditEntry);
        }

        return dbColaborator.active === false;
    }

    async activate(projectId: number, i18n: I18nContext, auditEntry: AudityEntryDto): Promise<boolean> {

        let dbColaborator = await this.findOne(projectId);

        if (!dbColaborator) {
            throw new NotFoundException(
                await i18n.translate('supplier.NOT_FOUND', {
                    args: { id: projectId },
                })
            );
        }

        dbColaborator.active = true;
        dbColaborator = await this.suppliersRepository.save(dbColaborator);

        if (auditEntry) {
            auditEntry.actionType = 'ACTIVATE';
            auditEntry.targetEntity = this.suppliersRepository.metadata.targetName;
            auditEntry.targetTable = this.suppliersRepository.metadata.tableName;
            auditEntry.targetEntityId = dbColaborator.id;
            auditEntry.targetEntityBody = '';
            this.auditService.audit(auditEntry);
        }

        return dbColaborator.active === true;
    }
}
