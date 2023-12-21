import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { WorkplanItem } from './workplan-item.entity';

@Entity({ name: 'tb_wpi_institute_cost' })
export class WPIInstituteCost {
  @PrimaryGeneratedColumn({ name: 'id_wpi_institute_cost' })
  id: number;

  @OneToMany(type => WorkplanItem, workplanItem => workplanItem.wpiInstituteCost, { nullable: false })
  @JoinColumn({ name: 'id_workplan_item' })
  workplanItem: WorkplanItem;

  @Column({ name: 'ds_description', type: 'text' })
  description: string;
  
}