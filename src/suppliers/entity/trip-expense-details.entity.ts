import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Expense } from './expense.entity';

@Entity({ name: 'tb_trip_exp_details' })
export class TripExpenseDetails {
  @PrimaryGeneratedColumn({ name: 'id_trip_exp_details' })
  id: number;

  @OneToMany(type => Expense, expense => expense.tripDetails, { nullable: false })
  @JoinColumn({ name: 'id_expense' })
  expense: Expense;

  @Column({ name: 'ds_passenger_name', length: 200, nullable: true })
  passengerName: string;

  @Column({ name: 'ds_passenger_cpf', length: 20, nullable: true })
  passengerCpf: string;

  @Column({ name: 'nm_ticket_value', type: 'float' })
  ticketValue: number;

  @Column({ name: 'nm_hosting_value', type: 'float' })
  hostingValue: number;

  @Column({ name: 'nm_daily_allowance_value', type: 'float' })
  dailyAllowanceValue: number;

}