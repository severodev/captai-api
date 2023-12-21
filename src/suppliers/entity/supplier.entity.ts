import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Document } from "../../documents/entity/document.entity";
import { City } from './../../location/entity/city.entity';
import { State } from './../../location/entity/state.entity';
import { Bank } from './../../projects/entity/bank.entity';
import { BudgetCategory } from './budget-category.entity';
import { Expense } from './expense.entity';

@Entity({ name: 'tb_supplier' })
export class Supplier {

    constructor(_id?: number) {
        if (_id) {
            this.id = _id;
        }
    }

    @PrimaryGeneratedColumn({ name: 'id_supplier' })
    id: number;

    @Column({ name: 'st_active', type: 'bool', default: true })
    active: boolean;

    @Column({ name: 'ds_name', length: 150 })
    name: string;

    @Column({ name: 'ds_company_name', length: 300, nullable: true })
    companyName: string;

    @ManyToOne(type => BudgetCategory, { nullable: false, eager: true })
    @JoinColumn({ name: 'id_budget_category' })
    budgetCategory: BudgetCategory;

    @Column({ name: 'ds_cnpj', length: 20 })
    cnpj: string;

    @Column({ name: 'ds_email', length: 200, nullable: true })
    email: string;

    @Column({ name: 'ds_website', length: 200, nullable: true })
    website: string;

    @Column({ name: 'ds_phone_main', length: 15, nullable: true })
    phoneMain: string;

    @Column({ name: 'ds_phone_secondary', length: 15, nullable: true })
    phoneSecondary: string;

    @Column({ name: 'ds_address', type: 'text', nullable: true })
    address: string;

    @Column({ name: 'ds_postal_code', length: 8, nullable: true })
    postalCode: string;

    @ManyToOne(type => State, { nullable: true })
    @JoinColumn({ name: 'id_state' })
    state: State;

    @Column({ name: 'ds_state_str', length: 100, nullable: true })
    stateStr: string;

    @ManyToOne(type => City, { nullable: true })
    @JoinColumn({ name: 'id_city' })
    city: City;

    @Column({ name: 'ds_city_str', length: 100, nullable: true })
    cityStr: string;

    @ManyToOne(type => Bank, { nullable: true })
    @JoinColumn({ name: 'id_bank' })
    bank: Bank;

    @Column({ name: 'ds_bank_agency', nullable: true })
    bankAgency: string;

    @Column({ name: 'ds_bank_account', nullable: true })
    bankAccount: string;

    @Column({ name: 'ds_notes', type: 'text', nullable: true })
    notes?: string;

    @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created: Date;

    @Column({ name: 'dt_last_update', type: 'timestamp', nullable: true })
    lastUpdate: Date;

    @OneToMany(type => Expense, expense => expense.supplier, { cascade: true })
    @JoinColumn()
    expenses: Expense[];

    @ManyToMany(type => Document, { cascade: true, nullable: true })
    @JoinTable({
        name: 'tb_supplier_documents',
        joinColumn: { name: 'id_supplier' },
        inverseJoinColumn: { name: 'id_document' }
    })
    documents: Document[];

}