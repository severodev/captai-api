import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { WorkplanItem } from './workplan-item.entity';

@Entity({ name: 'tb_wpi_equipment' })
export class WPIEquipment {

  @PrimaryGeneratedColumn({ name: 'id_wpi_equipment' })
  id: number;

  @OneToMany(type => WorkplanItem, workplanItem => workplanItem.wpiEquipment, { nullable: false })
  @JoinColumn({ name: 'id_workplan_item' })
  workplanItem: WorkplanItem;

  @Column({ name: 'ds_equipment_name', length: 200 })
  equipmentName: string;

  @Column({ name: 'ds_equipment_type', length: 200 })
  equipmentType: string;

  @Column({ name: 'ds_equipment_model', length: 80, nullable: true })
  equipmentModel: string;

  @Column({ name: 'nm_quantity', type: 'integer' })
  quantity: number;

  @Column({ name: 'dt_purchaseDate', type: 'date', nullable: true })
  purchaseDate: Date;

}
