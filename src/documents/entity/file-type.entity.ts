import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tb_file_type' })
export class FileType {
  
  @PrimaryGeneratedColumn({ name: 'id_file_type' })
  id: number;

  @Column({ name: 'ds_name', length: 100 })
  name: string;

  @Column({ name: 'ds_accepted_mimes', type: 'text', nullable: true })
  acceptedMimes: string;

  @Column({ name: 'ds_icon', length: 250, nullable: true })
  icon: string;

  @Column({ name: 'ds_icon_high_contrast', length: 250, nullable: true })
  iconHighContrast: string;

  @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: number;

  @Column({ name: 'dt_last_update', type: 'timestamp', nullable: true })
  lastUpdate: number;

}