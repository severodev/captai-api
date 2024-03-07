import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'tb_password_recovery' })
export class PasswordRecovery {

    @PrimaryGeneratedColumn({ name: 'id_password_recovery' })
    id: number;

    @ManyToOne(type => User, user => user.passwordRecovery)
    @JoinColumn({ name: 'id_user' })
    user: User;

    @Column({ name: 'ds_token', length: 200 })
    token: string;

    @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created: Date;

    @Column({ name: 'dt_expiration', type: 'timestamp', default: () => "NOW() + INTERVAL '6 hour'" })
    expiration: Date;

    @Column({ name: 'st_used', type: 'bool', default: false })
    used: boolean;

    @Column({ name: 'st_invalidated', type: 'bool', default: false })
    invalidated: boolean;

}