import {
  Column,
  Entity,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity({ name: 'tb_feedback_pagamento' })
export class Collaborator {
  @PrimaryGeneratedColumn({ name: 'id_feedback_pagamento' })
  id: number;

  @Column({
    name: 'dt_creation',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created: number;

}
