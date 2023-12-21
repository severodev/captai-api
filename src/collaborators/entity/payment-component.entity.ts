import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { Benefit } from './benefit.entity';
import { Payment } from './payment.entity';

@Entity({ name: 'tb_payment_component' })
export class PaymentComponent {

  @PrimaryGeneratedColumn({ name: 'id_payment_component', type: 'bigint'  })
  id: number;

  @ManyToOne(type => Payment, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_payment' })
  payment: Payment;

  @ManyToOne(type => Benefit, { nullable: true })
  @JoinColumn({ name: 'id_benefit' })
  benefit: Benefit;

  @Column({ name: 'ds_type', length: 50})
  type: string;
  
  @Column({ name: 'nm_value', type: 'float' })
  value: number;
  
  @Column({ name: 'ds_description', length: 250, nullable: true })
  description: string;

  @Column({ name: 'ds_notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'nm_lead_compensation', type: 'float', default: 0 })
  leadCompensation: number;

}