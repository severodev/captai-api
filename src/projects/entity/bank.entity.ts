import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tb_bank' })
export class Bank {
    @PrimaryGeneratedColumn({ name: 'id_bank' })
    id: number;

    @Column({ name: 'nm_code'})
    code: number;

    @Column({ name: 'ds_name', length: 150 })
    name: string;

    @Column({ name: 'st_active', type: 'bool', default: true })
    active: boolean;
    
}