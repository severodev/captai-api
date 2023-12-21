import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Collaborator } from '../../collaborators/entity/collaborator.entity';
import { WorkplanItem } from './workplan-item.entity';

@Entity({ name: 'tb_wpi_trip' })
export class WPITrip {
  @PrimaryGeneratedColumn({ name: 'id_wpi_trip' })
  id: number;

  @OneToMany(type => WorkplanItem, workplanItem => workplanItem.wpiTrip, { nullable: false })
  @JoinColumn({ name: 'id_workplan_item' })
  workplanItem: WorkplanItem;

  @ManyToOne(type => Collaborator, { nullable: true })
  @JoinColumn({ name: 'id_collaborator' })
  collaborator: Collaborator;

  @Column({ name: 'ds_event', length: 200 })
  event: string;

  @Column({ name: 'ds_itinerary', type: 'text' })
  itinerary: string;

  @Column({ name: 'ds_passenger_name', length: 200, nullable: true })
  passengerName: string;

  @Column({ name: 'ds_passenger_cpf', length: 20, nullable: true })
  passengerCpf: string;

  // @Column({ name: 'nm_ticket_value', type: 'float' })
  // ticketValue: number;

  // @Column({ name: 'nm_hosting_value', type: 'float' })
  // hostingValue: number;

  // @Column({ name: 'nm_daily_allowance_value', type: 'float' })
  // dailyAllowanceValue: number;

  @Column({ name: 'dt_start', type: 'date', nullable: true})
  start: Date;

  // @Column({ name: 'dt_end', type: 'date', nullable: true})
  // end: Date;

  @Column({ name: 'nm_days', type: 'integer'})
  days: number;

  @Column({ name: 'nm_quantity', type: 'integer'})
  quantity: number;

}