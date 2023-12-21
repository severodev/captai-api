import { Exclude } from 'class-transformer';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Permission } from './permission.entity';

@Entity({ name: 'tb_profile' })
export class Profile {
  @PrimaryGeneratedColumn({ name: 'id_profile' })
  id: number;

  @Column({ name: 'ds_key', length: 30 })
  key: string;

  @Column({ name: 'ds_title', length: 50 })
  title: string;

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

  @ManyToMany(type => Permission, { cascade: true })
  @JoinTable({
    name: 'tb_profile_permissions',
    joinColumn: { name: 'id_profile' },
    inverseJoinColumn: { name: 'id_permission' },
  })
  permissions: Permission[];

}