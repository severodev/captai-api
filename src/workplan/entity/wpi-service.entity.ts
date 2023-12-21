import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { WorkplanItem } from './workplan-item.entity';

@Entity({ name: 'tb_wpi_service' })
export class WPIService {

  @PrimaryGeneratedColumn({ name: 'id_wpi_service' })
  id: number;

  @OneToMany(type => WorkplanItem, workplanItem => workplanItem.wpiService, { nullable: false })
  @JoinColumn({ name: 'id_workplan_item' })
  workplanItem: WorkplanItem;

  @Column({ name: 'ds_contractor_name', length: 200 })
  contractorName: string;

  @Column({ name: 'ds_cpf', length: 20, nullable: true })
  cpf?: string;

  @Column({ name: 'ds_cnpj', length: 20, nullable: true })
  cnpj?: string;

  @Column({ name: 'ds_description', type: 'text' })
  description: string;

  @Column({ name: 'dt_start', type: 'date', nullable: true})
  start?: Date;

  @Column({ name: 'dt_end', type: 'date', nullable: true})
  end?: Date;

}