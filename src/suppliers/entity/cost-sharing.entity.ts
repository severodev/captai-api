import { Project } from './../../projects/entity/project.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Expense } from './expense.entity';

@Entity({ name: 'tb_cost_share' })
export class CostShare {

  constructor(_id?: number) {
    if (_id) {
      this.id = _id;
    }
  }

  @PrimaryGeneratedColumn({ name: 'id_cost_share' })
  id: number;

  @Column({ name: 'st_active', type: 'bool', default: true })
  active: boolean;

  @ManyToOne(type => Expense, expense => expense.costShare, { nullable: false })
  @JoinColumn({ name: 'id_expense' })
  expense: Expense;

  @ManyToOne(type => Project, {eager: true, nullable: false })
  @JoinColumn({ name: 'id_project' })
  project: Project;

  @Column({ name: 'nm_amount_value', type: 'float', nullable: true })
  value: number;

  @Column({ name: 'ds_description', length: 250, nullable: true })
  description: string;

  @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: number;

  @Column({ name: 'dt_last_update', type: 'timestamp', nullable: true })
  lastUpdate: number;

}