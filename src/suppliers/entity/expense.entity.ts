import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Document } from "../../documents/entity/document.entity";
import { BudgetCategory } from './budget-category.entity';
import { CostShare } from './cost-sharing.entity';
import { ExpenseInstallment } from './expense-installment.entity';
import { Supplier } from './supplier.entity';
import { TripExpenseDetails } from './trip-expense-details.entity';

@Entity({ name: 'tb_expense' })
export class Expense {

    constructor(_id?: number){
        if(_id){
            this.id = _id;
        }
    }
    
    @PrimaryGeneratedColumn({ name: 'id_expense' })
    id: number;

    @Column({ name: 'st_active', type: 'bool', default: true })
    active: boolean;

    @Column({ name: 'dt_request_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    requestDate: Date;

    @Column({ name: 'dt_confirmation_date', type: 'timestamp', nullable: true })
    confirmationDate: Date;

    @Column({ name: 'dt_due_date', type: 'date', nullable: true })
    dueDate: Date;

    @Column({ name: 'dt_payment_date', type: 'timestamp', nullable: true })
    paymentDate: Date;

    @Column({ name: 'dt_delivery_date', type: 'timestamp', nullable: true })
    deliveryDate: Date;

    @Column({ name: 'dt_warranty_date', type: 'date', nullable: true })
    warrantyDate: Date;

    @Column({ name: 'ds_description', type: 'text' })
    description: string;

    @Column({ name: 'nm_value', type: 'float' })
    value: number;

    @Column({ name: 'ds_status', length: 50, default: 'Previsto' })
    status: string;

    @ManyToOne(type => BudgetCategory, { nullable: true })
    @JoinColumn({ name: 'id_budget_category' })
    budgetCategory: BudgetCategory;

    @ManyToOne(type => Supplier, { nullable: true })
    @JoinColumn({ name: 'id_supplier' })
    supplier: Supplier;

    @Column({ name: 'ds_supplier_name', length: 200, nullable: true })
    supplierName: string;

    @OneToMany(type => CostShare, costShare => costShare.expense, { cascade: ['insert','update','remove'] })
    @JoinColumn()
    costShare: CostShare[];

    @ManyToMany(type => Document, { cascade: true, nullable: true })
    @JoinTable({
        name: 'tb_expense_documents',
        joinColumn: { name: 'id_expense' },
        inverseJoinColumn: { name: 'id_document' }
    })
    documents: Document[];

    @ManyToOne(type => TripExpenseDetails, { nullable: true, cascade: true })
    @JoinColumn({ name: 'id_trip_exp_details' })
    tripDetails: TripExpenseDetails;

    @OneToMany(type => ExpenseInstallment, installments => installments.expense, { cascade: true })
    @JoinColumn()
    installments: ExpenseInstallment[];

    @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created: Date;

    @Column({ name: 'dt_last_update', type: 'timestamp', nullable: true })
    lastUpdate: Date;

}