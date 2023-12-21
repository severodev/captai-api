import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tb_settings' })
export class ApplicationSettings {
  @PrimaryGeneratedColumn({ name: 'id_settings' })
  id: number;

  @Column({ name: 'st_active', type: 'bool', default: true })
  active: boolean;  

  @Column({ name: 'ds_key', length: 100 })
  key: string;

  @Column({ name: 'ds_value', length: 250 })
  value: string;

  @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: number;

  @Column({ name: 'dt_last_update', type: 'timestamp', nullable: true })
  lastUpdate: number;

}