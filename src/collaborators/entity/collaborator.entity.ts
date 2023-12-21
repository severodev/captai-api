import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Document } from '../../documents/entity/document.entity';
import { City } from './../../location/entity/city.entity';
import { State } from './../../location/entity/state.entity';
import { Benefit } from './benefit.entity';
import { Dependent } from './dependent.entity';
import { PayRollHistory } from './payroll-history.entity';
import { PayRoll } from './payroll.entity';

@Entity({ name: 'tb_collaborator' })
export class Collaborator {
  @PrimaryGeneratedColumn({ name: 'id_collaborator' })
  id: number;

  @Column({ name: 'st_active', type: 'bool', default: true })
  active: boolean;

  @Column({ name: 'ds_name', length: 200 })
  name: string;

  @Column({ name: 'ds_social_name', length: 200, nullable: true })
  socialName: string;

  @Column({ name: 'ds_cpf', length: 11, nullable: true })
  cpf: string;

  @Column({ name: 'ds_rg', length: 20, nullable: true })
  rg: string;

  @Column({ name: 'ds_rg_emitter', length: 50, nullable: true })
  rgEmitter: string;

  @Column({ name: 'ds_identity_document_type', length: 20, nullable: true })
  identityDocumentType: string;

  @Column({ name: 'ds_identity_document', length: 50, nullable: true })
  identityDocument: string;

  @Column({ name: 'ds_pis', length: 20, nullable: true })
  pis: string;

  @Column({ name: 'ds_marital_status', length: 25, nullable: true })
  maritalStatus: string;

  @Column({ name: 'ds_nationality', length: 100 })
  nationality: string;

  @Column({ name: 'dt_birth', type: 'date' })
  birthDate: Date;

  @Column({ name: 'ds_email', length: 200, nullable: true })
  email: string;

  @Column({ name: 'ds_personal_email', length: 200, nullable: true })
  personalEmail: string;

  @Column({ name: 'ds_phone', length: 15 })
  phone: string;

  @Column({ name: 'ds_mother_name', length: 200 })
  motherName: string;

  @Column({ name: 'ds_father_name', length: 200, nullable: true })
  fatherName: string;

  @Column({ name: 'ds_address', length: 300 })
  address: string;

  @Column({ name: 'ds_neighbourhood', length: 100 })
  neighbourhood: string;

  @Column({ name: 'ds_postal_code', length: 8 })
  postalCode: string;

  @ManyToOne(type => State, { nullable: true })
  @JoinColumn({ name: 'id_state' })
  state: State;

  @Column({ name: 'ds_state_str', length: 100, nullable: true })
  stateStr: string;

  @ManyToOne(type => City, { nullable: true })
  @JoinColumn({ name: 'id_city' })
  city: City;

  @Column({ name: 'ds_city_str', length: 100, nullable: true })
  cityStr: string;

  @Column({ name: 'ds_emergency_contact', length: 100, nullable: true })
  emergencyContact1: string;

  @Column({ name: 'ds_emergency_parentage', length: 100, nullable: true })
  emergencyParentage1: string;

  @Column({ name: 'ds_emergency_phone', length: 15, nullable: true })
  emergencyPhone1: string;

  @Column({ name: 'ds_emergency_contact_2', length: 100, nullable: true })
  emergencyContact2: string;

  @Column({ name: 'ds_emergency_parentage_2', length: 100, nullable: true })
  emergencyParentage2: string;

  @Column({ name: 'ds_emergency_phone_2', length: 15, nullable: true })
  emergencyPhone2: string;

  @Column({ name: 'ds_job_title', length: 100, nullable: true })
  jobTitle: string;

  @Column({ name: 'ds_activities', type: 'text', nullable: true })
  activities: string;

  @Column({ name: 'ds_academic_degree', length: 100, nullable: true })
  academicDegree?: string;

  @Column({ name: 'ds_educational_institution', length: 150, nullable: true })
  educationalInstitution?: string;

  @Column({ name: 'ds_lattes', length: 200, nullable: true })
  lattes: string;

  @Column({ name: 'ds_image', length: 500, nullable: true })
  image: string;

  @Column({ name: 'tp_gender', length: 5, nullable: true, default: 'M' })
  gender: string;

  @Column({
    name: 'dt_creation',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created: number;

  @Column({ name: 'dt_last_update', type: 'timestamp', nullable: true })
  lastUpdate: number;

  @OneToMany(
    type => Dependent,
    dependent => dependent.collaborator,
    { cascade: true },
  )
  @JoinColumn()
  dependents: Dependent[];

  @ManyToMany(type => Document, { cascade: true })
  @JoinTable({
    name: 'tb_collaborator_documents',
    joinColumn: { name: 'id_collaborator' },
    inverseJoinColumn: { name: 'id_document' },
  })
  documents: Document[];

  @ManyToMany(type => Benefit, { cascade: true })
  @JoinTable({
    name: 'tb_collaborator_benefits',
    joinColumn: { name: 'id_collaborator' },
    inverseJoinColumn: { name: 'id_benefit' },
  })
  benefits: Benefit[];

  @OneToMany(
    type => PayRoll,
    payroll => payroll.collaborator,
    { cascade: true },
  )
  @JoinColumn()
  payroll: PayRoll[];

  @OneToMany(
    type => PayRollHistory,
    payrollHistory => payrollHistory.collaborator,
    { cascade: true },
  )
  @JoinColumn()
  payrollHistory: PayRollHistory[];
}
