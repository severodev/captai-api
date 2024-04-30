import { User } from 'src/users/entity/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';

@Entity({ name: 'tb_activite' })
export class Activite {

  @PrimaryGeneratedColumn({ name: 'id_activite' })
  id: number;

  @Column({ name: 'ds_title', nullable: true })
  name: string;

  @ManyToMany(() => User, user => user.activite)
  User: User[];
} 