import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tb_budget_category' })
export class BudgetCategory {

  constructor(_id?: number) {
    if (_id) {
      this.id = _id;
    }
  }

  @PrimaryGeneratedColumn({ name: 'id_budget_category' })
  id: number;

  @Column({ name: 'st_active', type: 'bool', default: true })
  active: boolean;

  @Column({ name: 'st_allow_expense', type: 'bool', default: true })
  allowExpense: boolean;

  @Column({ name: 'ds_code', length: 50, nullable: true })
  code: string;

  @Column({ name: 'ds_name', length: 100, nullable: true})
  name: string;

  @Column({ name: 'nm_order', type: 'int', nullable: true })
  order: number;

  @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: number;

  @Column({ name: 'dt_last_update', type: 'timestamp', nullable: true })
  lastUpdate: number;

}