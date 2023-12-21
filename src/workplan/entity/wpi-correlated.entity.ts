import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Supplier } from '../../suppliers/entity/supplier.entity';
import { WorkplanItem } from './workplan-item.entity';

@Entity({ name: 'tb_wpi_correlated' })
export class WPICorrelated {

  @PrimaryGeneratedColumn({ name: 'id_wpi_correlated' })
  id: number;

  @OneToMany(type => WorkplanItem, workplanItem => workplanItem.wpiCorrelated, { nullable: false })
  @JoinColumn({ name: 'id_workplan_item' })
  workplanItem: WorkplanItem;

  @ManyToOne(type => Supplier, { nullable: true, eager: true })
  @JoinColumn({ name: 'id_supplier' })
  supplier: Supplier;

  @Column({ name: 'ds_supplier_name', length: 200, nullable: true })
  supplierName: string;

  @Column({ name: 'ds_description', type: 'text' })
  description: string;

  @Column({ name: 'ds_accounting_appropriation', type: 'text', nullable: true })
  accountingAppropriation: string;

}