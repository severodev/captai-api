import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentComponent } from './payment-component.entity';
import { PayRoll } from './payroll.entity';

@Entity({ name: 'tb_payment' })
export class Payment {

  @PrimaryGeneratedColumn({ name: 'id_payment', type: 'bigint'  })
  id: number;

  @Column({ name: 'st_active', type: 'bool', default: true })
  active: boolean;

  @ManyToOne(type => PayRoll, payroll => payroll.payments, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_payroll' })
  payroll: PayRoll;
  
  @Column({ name: 'ds_year', length: 4 })
  year: string;
  
  @Column({ name: 'ds_month', length: 2 })
  month: string;
  
  @OneToMany(type => PaymentComponent, paymentComponent => paymentComponent.payment, { cascade: ["insert", "update", "remove"] })
  @JoinColumn()
  components: PaymentComponent[];
  
  @Column({ name: 'nm_total_value', type: 'float' })
  totalValue: number;
  
  @Column({ name: 'st_paid', type: 'bool', default: false })
  paid: boolean;

  @Column({ name: 'dt_payment_date', type: 'date', nullable: true})
  paymentDate: Date;

  @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: Date;

  @Column({ name: 'dt_last_update', type: 'timestamp', nullable: true })
  lastUpdate: Date;

}