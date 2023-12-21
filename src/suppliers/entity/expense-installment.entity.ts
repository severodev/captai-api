import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from '../../projects/entity/project.entity';
import { Expense } from './expense.entity';

@Entity({ name: 'tb_expense_installments' })
export class ExpenseInstallment {

  @PrimaryGeneratedColumn({ name: 'id_expense_installment' })
  id: number;

  @Column({ name: 'nm_order', type: 'integer' })
  order: number;

  @Column({ name: 'ds_description', nullable: true })
  description: string;

  @Column({ name: 'dt_payment_date', type: 'date' })
  paymentDate: Date;

  @Column({ name: 'nm_month', type: 'integer' })
  month: number;

  @Column({ name: 'nm_year', type: 'integer' })
  year: number;

  @Column({ name: 'nm_value', type: 'float' })
  value: number;

  @Column({ name: 'st_paid', type: 'bool', default: false })
  isPaid: boolean;

  @ManyToOne(type => Expense, { nullable: true })
  @JoinColumn({ name: 'id_expense' })
  expense: Expense;

  @ManyToOne(type => Project, {eager: true, nullable: true })
  @JoinColumn({ name: 'id_project' })
  project: Project;

  @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: number;

  @Column({ name: 'dt_last_update', type: 'timestamp', nullable: true })
  lastUpdate: number;

}