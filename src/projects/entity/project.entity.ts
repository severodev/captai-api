import * as moment from 'moment';
import { AfterLoad, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Document } from "../../documents/entity/document.entity";
import { Institute } from '../../institutes/entity/institute.entity';
import { Loan } from '../../modules/loan/entities/loan.entity';
import { WorkplanItem } from '../../workplan/entity/workplan-item.entity';
import { ExpenseGridDto } from '../interfaces/expense-grid.dto';
import { MarginGridDto } from '../interfaces/margin-grid.dto';
import { Bank } from './bank.entity';
import { ProjectExtension } from './project-extension.entity';
import { ProjectMember } from './project-member.entity';

@Entity({ name: 'tb_project' })
export class Project {

    constructor(_id?: number){
        if(_id){
            this.id = _id;
        }
    }

    @PrimaryGeneratedColumn({ name: 'id_project' })
    id: number;

    @Column({ name: 'st_active', type: 'bool', default: true })
    active: boolean;

    @Column({ name: 'ds_name', length: 150 })
    name: string;

    @Column({ name: 'ds_description', type: 'text', nullable: true })
    description?: string;

    @Column({ name: 'dt_start', type: 'date' })
    start: Date;

    @Column({ name: 'dt_end', type: 'date', nullable: true })
    end: Date;

    @Column({ name: 'nm_budget', type: 'float', nullable: true })
    budget: number;

    @Column({ name: 'ds_amendment_term', type: 'text', nullable: true })
    amendmentTerm?: string;

    @ManyToOne(type => Institute)
    @JoinColumn({ name: 'id_institute' })
    institute: Institute;

    @ManyToOne(type => Bank, { nullable: true })
    @JoinColumn({ name: 'id_bank' })
    bank: Bank;

    @Column({ name: 'ds_bank_agency', nullable: true })
    bankAgency: string;

    @Column({ name: 'ds_bank_account', nullable: true })
    bankAccount: string;

    @Column({ name: 'ds_notes', type: 'text', nullable: true })
    notes?: string;

    @Column({ name: 'ds_report_project_name', type: 'text', nullable: true })
    reportProjectName?: string;

    @Column({ name: 'ds_report_project_contract_type', length: 100, nullable: true })
    reportProjectContractType?: string;

    @Column({ name: 'ds_report_project_contract_number', length: 50, nullable: true })
    reportProjectContractNumber?: string;

    @Column({ name: 'ds_report_project_coordinator', length: 150, nullable: true })
    reportProjectCoordinator?: string;

    @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created: Date;

    @Column({ name: 'dt_last_update', type: 'timestamp', nullable: true })
    lastUpdate: Date;

    @Column({ name: 'nm_last_margin', type: 'float', nullable: true })
    lastMargin: number;

    @ManyToMany(type => Document, { cascade: true })
    @JoinTable({
        name: 'tb_project_documents',
        joinColumn: { name: 'id_project' },
        inverseJoinColumn: { name: 'id_document' }
    })
    documents: Document[];

    @OneToMany(type => ProjectMember, projectMember => projectMember.project, { eager: true, cascade: true })
    @JoinColumn()
    projectMembers: ProjectMember[];

    @OneToMany(type => WorkplanItem, workplanItem => workplanItem.project, { cascade: true })
    @JoinColumn()
    workplan: WorkplanItem[];

    @ManyToOne(type => ProjectExtension, { nullable: true })
    @JoinColumn({ name: 'id_project_extension' })
    projectExtension: ProjectExtension;

    @OneToMany(
        () => Loan,
        loan => loan.id,
    )
    @JoinColumn({ name : 'loan_came_out' })
    loanCameOut : Loan[];

    @OneToMany(
        () => Loan,
        loan => loan.id,
    )
    @JoinColumn({ name : 'loan_entered' })
    loanEntered : Loan[];

    @Column({ name: 'ds_payment_order', nullable: true })
    paymentOrder: string;

    @Column({ name: 'ds_project_manager', nullable: true })
    projectManager: string;

    @Column({ name: 'ds_project_coordinator', nullable: true })
    projectCoordinator: string;

    progress: number;

    totalMembers?: number;

    remainingMarginPercentage?: number;

    utilizedFundsPercentage?: number;

    marginsGrid?: MarginGridDto;

    expensesGrid?: ExpenseGridDto;

    @AfterLoad()
    calculateProgress(): void {
        if(this.start && this.end){
            const startDate = moment(this.start);
            const endDate = moment(this.end);
            const totalDays = endDate.diff(startDate, 'days');
            const remainingDays = endDate.diff(moment(), 'days');
            this.progress = remainingDays > 0 ? parseFloat((remainingDays / totalDays).toFixed(2)) : 1;
        }

        if(this.projectMembers){
            this.totalMembers = this.projectMembers.length;
        }

        if(this.lastMargin){
            this.remainingMarginPercentage = this.lastMargin / this.budget;
            this.utilizedFundsPercentage = (this.budget - this.lastMargin) / this.budget;
        }
    }

}