import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { WorkplanItem } from './workplan-item.entity';

@Entity({ name: 'tb_wpi_supplies' })
export class WPISupplies {
  @PrimaryGeneratedColumn({ name: 'id_wpi_supplies' })
  id: number;

  @OneToMany(type => WorkplanItem, workplanItem => workplanItem.wpiSupplies, { nullable: false })
  @JoinColumn({ name: 'id_workplan_item' })
  workplanItem: WorkplanItem;

  @Column({ name: 'ds_description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'nm_quantity', type: 'integer', nullable: true })
  quantity: number;

  @Column({ name: 'ds_accounting_appropriation', type: 'text', nullable: true })
  accountingAppropriation: string;

}