import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tb_role' })
export class Role {
  @PrimaryGeneratedColumn({ name: 'id_role' })
  id: number;

  @Column({ name: 'tp_role', length: 50 })
  type: string;

  @Column({ name: 'ds_name', length: 50, nullable: true })
  name: string;

  @Column({ name: 'ds_description', length: 255, nullable: true })
  description: string;

  @Column({ name: 'nm_level', default: 1 })
  level: number;

}