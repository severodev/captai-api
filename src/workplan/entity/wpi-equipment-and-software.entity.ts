import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Validity } from './validity.entity';
import { WorkplanItem } from './workplan-item.entity';

@Entity({ name: 'tb_wpi_equipment_and_software' })
export class WPIEquipmentAndSoftware {

  @PrimaryGeneratedColumn({ name: 'id_wpi_equipment_and_software' })
  id: number;

  @OneToMany(type => WorkplanItem, workplanItem => workplanItem.wpiEquipmentAndSoftware, { nullable: false })
  @JoinColumn({ name: 'id_workplan_item' })
  workplanItem: WorkplanItem;

  @Column({ name: 'ds_item_name', length: 200 })
  itemName: string;

  @Column({ name: 'ds_item_type', length: 200 })
  itemType: string;

  @ManyToOne(type => Validity, { nullable: true, eager: true })
  @JoinColumn({ name: 'id_validity' })
  validity: Validity;

  @Column({ name: 'ds_equipment_model', length: 80, nullable: true })
  equipmentModel: string;

  @Column({ name: 'nm_quantity', type: 'integer' })
  quantity: number;

  @Column({ name: 'dt_purchaseDate', type: 'date', nullable: true })
  purchaseDate: Date;

}
