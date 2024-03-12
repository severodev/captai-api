import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'tb_first_access' })
export class FirstAccess {

  @PrimaryGeneratedColumn({ name: 'id_first_access' })
  id: number;

  @ManyToOne(type => User, user => user.firstAccess)
  @JoinColumn({ name: 'id_user' })
  user: User;

  @Column({ name: 'ds_token', length: 200 })
  token: string;

  @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: Date;

  @Column({ name: 'dt_expiration', type: 'timestamp', default: () => "NOW() + INTERVAL '72 hour'" })
  expiration: Date;

  @Column({ name: 'st_valid', type: 'bool', default: true })
  valid: boolean;

}
