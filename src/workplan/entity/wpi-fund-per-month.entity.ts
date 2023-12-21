import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { WorkplanItem } from './workplan-item.entity';

@Entity({ name: 'tb_wpi_fund_per_month' })
export class WPIFundPerMonth {

  @PrimaryGeneratedColumn({ name: 'id_wpi_fund_per_month' })
  id: number;

  @Column({ name: 'nm_month', type: 'integer' })
  month: number;

  @Column({ name: 'nm_year', type: 'integer' })
  year: number;

  @Column({ name: 'nm_value', type: 'float' })
  value: number;

  @ManyToOne(type => WorkplanItem, { nullable: true })
  @JoinColumn({ name: 'id_workplan_item' })
  workplanItem: WorkplanItem;

}