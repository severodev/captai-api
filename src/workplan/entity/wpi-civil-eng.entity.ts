import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Supplier } from '../../suppliers/entity/supplier.entity';
import { WorkplanItem } from './workplan-item.entity';

@Entity({ name: 'tb_wpi_civil_eng' })
export class WPICivilEngineering {
  
  @PrimaryGeneratedColumn({ name: 'id_wpi_civil_eng' })
  id: number;

  @OneToMany(type => WorkplanItem, workplanItem => workplanItem.wpiCivilEngineering, { nullable: false })
  @JoinColumn({ name: 'id_workplan_item' })
  workplanItem: WorkplanItem;

  @ManyToOne(type => Supplier, { nullable: true, eager: true })
  @JoinColumn({ name: 'id_supplier' })
  supplier: Supplier;

  @Column({ name: 'ds_supplier_name', length: 200, nullable: true })
  supplierName: string;

  @Column({ name: 'ds_description', type: 'text' })
  description: string;

  @Column({ name: 'ds_accounting_appropriation', length: 200, nullable: true })
  accountingAppropriation: string;

}