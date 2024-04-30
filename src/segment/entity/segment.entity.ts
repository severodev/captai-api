import { User } from 'src/users/entity/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, OneToMany } from 'typeorm';

@Entity({ name: 'tb_segment' })
export class Segment {

  @PrimaryGeneratedColumn({ name: 'id_segment' })
  id: number;

  @Column({ name: 'name', nullable: true })
  name: string;

  @OneToMany(type => User, User => User.segment, { cascade: ['insert','update','remove'] })
  @JoinColumn()
  user: User[];
}