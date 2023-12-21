import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Validity } from './validity.entity';
import { WorkplanItem } from './workplan-item.entity';

@Entity({ name: 'tb_wpi_software_licenses' })
export class WPISoftwareLicenses {

  @PrimaryGeneratedColumn({ name: 'id_wpi_software_licenses' })
  id: number;

  @OneToMany(type => WorkplanItem, workplanItem => workplanItem.wpiSoftwareLicenses, { nullable: false })
  @JoinColumn({ name: 'id_workplan_item' })
  workplanItem: WorkplanItem;

  @Column({ name: 'ds_software_name', length: 200 })
  softwareName: string;

  @ManyToOne(type => Validity, { nullable: true, eager: true })
  @JoinColumn({ name: 'id_validity' })
  validity: Validity;

  @Column({ name: 'nm_quantity', type: 'integer' })
  quantity: number;

  @Column({ name: 'dt_purchaseDate', type: 'date', nullable: true })
  purchaseDate: Date;

}
