import { Exclude } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tb_permission' })
export class Permission {
  @PrimaryGeneratedColumn({ name: 'id_permission' })
  id: number;

  @Column({ name: 'ds_key', length: 80 })
  key: string;

  @Column({ name: 'ds_name', length: 100, nullable: true })
  name: string;

  @Column({ name: 'ds_description', length: 100, nullable: true })
  description: string;

  @Exclude()
  @Column({ name: 'st_active', type: 'bool', default: true })
  active: boolean;

  @Exclude()
  @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: number;

  @Exclude()
  @Column({ name: 'dt_last_update', type: 'timestamp', nullable: true })
  lastUpdate: number;

}