import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from '../../projects/entity/project.entity';
import { WPIBooksJournals } from './wpi-books-journals.entity';
import { WPICivilEngineering } from './wpi-civil-eng.entity';
import { WPIEquipment } from './wpi-equipment.entity';
import { WPIHumanResources } from './wpi-human-resources.entity';
import { WPIInstituteCost } from './wpi-institute-cost.entity';
import { WPIService } from './wpi-service.entity';
import { WPISoftwareLicenses } from './wpi-software-licenses.entity';
import { WPISupplies } from './wpi-supplies.entity';
import { WPICorrelated } from './wpi-correlated.entity';
import { WPITraining } from './wpi-training.entity';
import { WPITrip } from './wpi-trip.entity';
import { WPIFundPerMonth } from './wpi-fund-per-month.entity';
import { WPIEquipmentAndSoftware } from './wpi-equipment-and-software.entity';

@Entity({ name: 'tb_workplan_item' })
export class WorkplanItem {
  @PrimaryGeneratedColumn({ name: 'id_workplan_item' })
  id: number;

  @ManyToOne(type => Project, { nullable: false })
  @JoinColumn({ name: 'id_project' })
  project: Project;

  @Column({ name: 'st_active', type: 'bool', default: true })
  active: boolean;

  @Column({ name: 'ds_category', length: 100 })
  category: string;

  @Column({ name: 'nm_value', type: 'float' })
  value: number;

  @Column({ name: 'ds_rationale', type: 'text' })
  rationale: string;

  @Column({ name: 'ds_project_stage', length: 100, nullable: true })
  projectStage?: string;

  @ManyToOne(type => WPIHumanResources, { nullable: true, cascade: true })  
  @JoinColumn({ name: 'id_wpi_hr' })
  wpiHR: WPIHumanResources;

  @ManyToOne(type => WPITrip, { nullable: true, cascade: true })
  @JoinColumn({ name: 'id_wpi_trip' })
  wpiTrip: WPITrip;

  @ManyToOne(type => WPITraining, { nullable: true, cascade: true })
  @JoinColumn({ name: 'id_wpi_training' })
  wpiTraining: WPITraining;

  @ManyToOne(type => WPIService, { nullable: true, cascade: true })
  @JoinColumn({ name: 'id_wpi_service' })
  wpiService: WPIService;

  @ManyToOne(type => WPIEquipment, { nullable: true, cascade: true })
  @JoinColumn({ name: 'id_wpi_equipment' })
  wpiEquipment: WPIEquipment;

  @ManyToOne(type => WPISoftwareLicenses, { nullable: true, cascade: true })
  @JoinColumn({ name: 'id_wpi_software_licenses' })
  wpiSoftwareLicenses: WPISoftwareLicenses;
  
  @ManyToOne(type => WPIEquipmentAndSoftware, { nullable: true, cascade: true })
  @JoinColumn({ name: 'id_wpi_equipment_and_software' })
  wpiEquipmentAndSoftware: WPIEquipmentAndSoftware;

  @ManyToOne(type => WPISupplies, { nullable: true, cascade: true })
  @JoinColumn({ name: 'id_wpi_supplies' })
  wpiSupplies: WPISupplies;

  @ManyToOne(type => WPIBooksJournals, { nullable: true, cascade: true })
  @JoinColumn({ name: 'id_wpi_books_journals' })
  wpiBooksJournals: WPIBooksJournals;

  @ManyToOne(type => WPICivilEngineering, { nullable: true, cascade: true })
  @JoinColumn({ name: 'id_wpi_civil_eng' })
  wpiCivilEngineering: WPICivilEngineering;

  @ManyToOne(type => WPICorrelated, { nullable: true, cascade: true })
  @JoinColumn({ name: 'id_wpi_correlated' })
  wpiCorrelated: WPICorrelated;

  @ManyToOne(type => WPIInstituteCost, { nullable: true, cascade: true })
  @JoinColumn({ name: 'id_wpi_institute_cost' })
  wpiInstituteCost: WPIInstituteCost;

  @OneToMany(type => WPIFundPerMonth, wpiFundPerMonth => wpiFundPerMonth.workplanItem, { cascade: true })
  @JoinColumn()
  wpiFundPerMonth: WPIFundPerMonth[];

  @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: number;

  @Column({ name: 'dt_last_update', type: 'timestamp', nullable: true })
  lastUpdate: number;

}